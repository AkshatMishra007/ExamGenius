# main.py - FastAPI Backend

import json
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# --- Configuration ---
# Your React/Vite development server may run on different ports (5173 or 8080).
# Allow both common dev origins so the frontend can call the API during development.
FRONTEND_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:8080",
]
OLLAMA_API_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "llama3.1" # Or "llama3.1" or any other model you have pulled

app = FastAPI(title="ExamGenius LLM API")

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,  # Allow common local dev frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas ---
class QuestionGenerationRequest(BaseModel):
    topic: str
    difficulty: str
    count: int

class Question(BaseModel):
    question: str
    options: list[str]

class QuestionPaperResponse(BaseModel):
    questions: list[Question]

class AnswerRequest(BaseModel):
    question: str
    
class AnswerResponse(BaseModel):
    answer_text: str

# --- Mode 1: Question Generation Endpoint ---
@app.post("/api/generate-questions", response_model=QuestionPaperResponse)
async def generate_questions(req: QuestionGenerationRequest):
    """
    Generates a question paper using the 'Exam Paper Creator' persona.
    """
    prompt = f"""
    You are an expert exam paper creator.
    Generate {req.count} questions on the topic: "{req.topic}".
    Difficulty: {req.difficulty}.
    The questions must be in Multiple Choice Question (MCQ) format with four options (A, B, C, D).
    Do NOT provide answers or hints in this response.
    Return only a clean JSON list of objects in the following format. The entire output must be parsable JSON:
    [
      {{"question": "What is the capital of France?", "options": ["A. Paris", "B. Rome", "C. Berlin", "D. Madrid"]}},
      ...
    ]
    """
    
    payload = {
        "model": DEFAULT_MODEL,
        "prompt": prompt,
        "temperature": 0.5,
        "stream": False,
        "format": "json" # Ollama setting to encourage JSON output
    }
    
    try:
        ollama_res = requests.post(OLLAMA_API_URL, json=payload, timeout=120)
        ollama_res.raise_for_status()
        raw_response = ollama_res.json().get("response", "")
        
        # Simple attempt to clean and parse the JSON response
        # Ollama's 'json' format often still wraps in a markdown block
        try:
            # Find and parse JSON between a markdown block
            json_data = json.loads(raw_response.strip('```json').strip('```').strip())
        except json.JSONDecodeError:
            # Fallback to try and parse the raw string
            json_data = json.loads(raw_response.strip())

        # Accept either a bare list of questions or a dict wrapper like {"questions": [...]}.
        # Pydantic expects a list here; if the model returned a wrapper, unwrap it.
        if isinstance(json_data, dict):
            if "questions" in json_data and isinstance(json_data["questions"], list):
                json_data = json_data["questions"]
            else:
                # If some other dict shape contains the list as a value, try to find it.
                for v in json_data.values():
                    if isinstance(v, list):
                        json_data = v
                        break

        return QuestionPaperResponse(questions=json_data)
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Ollama connection error: {e}")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Model output is not valid JSON: {e}. Raw response: {raw_response[:300]}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected server error occurred: {e}")


# --- Mode 2: Answer / Hint Generation Endpoint ---
@app.post("/api/reveal-answer", response_model=AnswerResponse)
async def reveal_answer(req: AnswerRequest):
    """
    Provides the correct answer and a one-line explanation using the 'Expert Tutor' persona.
    """
    prompt = f"""
    You are an expert tutor.
    Provide the **correct answer** and a detailed, one-paragraph explanation
    for this question:
    "{req.question}"

    Your response must be clear and direct, starting with 'Correct Answer:'
    """
    
    payload = {
        "model": DEFAULT_MODEL,
        "prompt": prompt,
        "temperature": 0.1, # Lower temp for factual, deterministic answer
        "stream": False,
    }
    
    try:
        ollama_res = requests.post(OLLAMA_API_URL, json=payload, timeout=60)
        ollama_res.raise_for_status()
        answer_text = ollama_res.json().get("response", "Could not retrieve answer.")
        
        return AnswerResponse(answer_text=answer_text)

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Ollama connection error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected server error occurred: {e}")


@app.get("/api/health")
def api_health_check():
    """
    Health endpoint compatible with the frontend's expected /api/health path.
    """
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        models = response.json().get("models", [])
        return {
            "status": "healthy",
            "ollama_connected": True,
            "available_models": [m.get("name") for m in models]
        }
    except:
        return {
            "status": "unhealthy",
            "ollama_connected": False,
            "message": "Cannot connect to Ollama"
        }