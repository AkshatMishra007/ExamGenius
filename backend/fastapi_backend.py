"""
ExamGenius Backend (Gemini-Only)
--------------------------------
FastAPI backend using Google AI Studio (Gemini) for:
- Question generation
- Hint generation
- Answer explanation
- Vector similarity search
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests, os, json, re
from typing import List, Optional
from vector_store import VectorStore  # or vector_store_faiss if preferred

# =========================
# App Setup
# =========================
app = FastAPI(title="ExamGenius - Gemini API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Config
# =========================
AI_STUDIO_URL = os.getenv(
    "AI_STUDIO_URL",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
)
AI_STUDIO_KEY = os.getenv("AI_STUDIO_KEY")

if not AI_STUDIO_KEY:
    raise RuntimeError("Missing Gemini API key. Please set AI_STUDIO_KEY in environment.")

# =========================
# Models
# =========================
class GenerateQuestionsRequest(BaseModel):
    topic: str
    difficulty: str
    count: int

class SimilarQuestionRequest(BaseModel):
    question: str
    limit: Optional[int] = 5

class GetHintRequest(BaseModel):
    question: str

class GetAnswerRequest(BaseModel):
    question: str

# =========================
# Initialize Vector Store
# =========================
vector_store = VectorStore()

# =========================
# Helper - Gemini Call
# =========================
def call_gemini(prompt: str, temperature: float = 0.4, max_tokens: int = 2048) -> str:
    """
    Send a text generation request to Google AI Studio (Gemini)
    """
    try:
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": AI_STUDIO_KEY
        }
        body = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            }
        }

        response = requests.post(AI_STUDIO_URL, headers=headers, json=body, timeout=90)
        response.raise_for_status()
        data = response.json()

        # Extract generated text
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

# =========================
# Endpoints
# =========================

@app.post("/api/generate-questions")
async def generate_questions(req: GenerateQuestionsRequest):
    """
    Generate questions using Gemini
    """
    prompt = f"""
You are a professional question paper creator.

Generate exactly {req.count} {req.difficulty}-level multiple-choice questions on the topic "{req.topic}".

Return ONLY a valid JSON array of objects, formatted exactly like this:

[
  {{
    "question": "What is ...?",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correct_option": "B",
    "explanation": "Explain why B is correct.",
    "hint": "Give a short guiding hint."
  }}
]
Do not include markdown or extra text.
"""

    try:
        text = call_gemini(prompt)
        match = re.search(r'\[.*\]', text, re.S)
        if not match:
            raise HTTPException(status_code=500, detail="Gemini output did not contain a JSON array.")
        parsed = json.loads(match.group())

        final_questions = []
        for q in parsed:
            if not all(k in q for k in ["question", "options", "explanation", "hint"]):
                continue
            vector_store.insert_question(q["question"], q["options"], q["explanation"], q["hint"])
            final_questions.append(q)

        return {
            "success": True,
            "count": len(final_questions),
            "questions": final_questions,
            "topic": req.topic,
            "difficulty": req.difficulty
        }

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON from Gemini: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search-similar")
async def search_similar_questions(req: SimilarQuestionRequest):
    try:
        return vector_store.search_similar_questions(req.question, req.limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/get-hint")
async def get_hint(req: GetHintRequest):
    prompt = f"""
You are a helpful tutor. Provide a subtle hint for this question without revealing the answer.

Question: {req.question}

Rules:
- Do not reveal the answer.
- Use 1-2 sentences only.
- Encourage critical thinking.
- Mention relevant concept keywords.
"""
    try:
        hint = call_gemini(prompt, temperature=0.6)
        return {"success": True, "hint": hint.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/get-answer")
async def get_answer(req: GetAnswerRequest):
    prompt = f"""
You are an expert tutor. Provide the correct answer and an explanation.

Question: {req.question}

Respond in this exact JSON format:
{{
  "answer": "The correct answer here",
  "explanation": "2-3 sentences explaining why this is correct."
}}
"""
    try:
        text = call_gemini(prompt, temperature=0.3)
        match = re.search(r'\{.*\}', text, re.S)
        if not match:
            return {"success": True, "answer": text.strip(), "explanation": "Explanation unavailable."}
        data = json.loads(match.group())
        return {"success": True, **data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health():
    return {"status": "healthy", "model": "Gemini 1.5 Flash", "vector_store": "active"}
