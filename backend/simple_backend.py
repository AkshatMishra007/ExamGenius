"""
FastAPI Backend for ExamGenius - Simple Version (No Vector Store)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import json
from typing import List, Optional

app = FastAPI(title="ExamGenius API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_API_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "llama3"

class GenerateQuestionsRequest(BaseModel):
    topic: str
    difficulty: str
    count: int

class Question(BaseModel):
    id: int
    question: str
    options: List[str]
    explanation: str

class GetHintRequest(BaseModel):
    question: str

class GetAnswerRequest(BaseModel):
    question: str

def call_ollama(prompt: str, model: str = DEFAULT_MODEL, temperature: float = 0.7) -> str:
    """Call Ollama API with the given prompt"""
    try:
        payload = {
            "model": model,
            "prompt": prompt,
            "system": "You are an expert exam question generator.",
            "stream": False,
            "temperature": temperature,
            "top_p": 0.9,
            "num_ctx": 4096,
            "stop": ["</s>"],
            "seed": 42
        }
        print("Sending request to Ollama:", OLLAMA_API_URL)
        print("Payload:", json.dumps(payload, indent=2))
        
        response = requests.post(OLLAMA_API_URL, json=payload)
        response.raise_for_status()
        return response.json()["response"]
    except Exception as e:
        print(f"Error calling Ollama: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error calling LLM: {str(e)}")

@app.get("/")
def root():
    return {
        "message": "ExamGenius API - Powered by Llama 3",
        "endpoints": {
            "/api/generate-questions": "Generate MCQs",
            "/api/get-hint": "Get question hint",
            "/api/get-answer": "Get answer with explanation"
        }
    }

@app.post("/api/generate-questions")
async def generate_questions(request: GenerateQuestionsRequest):
    """Generate questions based on topic and difficulty"""
    try:
        # Create prompt for Ollama
        prompt = f"Create {request.count} {request.difficulty} multiple-choice questions about {request.topic}.\n\nOutput a valid JSON array like this EXACTLY:\n[\n  {{\n    \"question\": \"Clear question text here?\",\n    \"options\": [\n      \"A. First option\",\n      \"B. Second option **correct answer**\",\n      \"C. Third option\",\n      \"D. Fourth option\"\n    ],\n    \"explanation\": \"Why B is correct, key concepts, and common misconceptions\"\n  }},\n  ...\n]"
        
        # Get response from Ollama
        response = call_ollama(prompt)
        print("Attempting to parse JSON:", response)
        
        # Parse JSON response
        questions = json.loads(response)
        print(f"Successfully parsed JSON, got {len(questions)} questions")
        return questions
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Error parsing LLM response: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/get-hint")
async def get_hint(request: GetHintRequest):
    """Get a hint for a specific question"""
    try:
        prompt = f"""For this question: {request.question}
        
        Give a helpful hint that guides towards the answer without revealing it directly.
        Focus on key concepts or thinking steps."""
        
        response = call_ollama(prompt)
        return {"hint": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/get-answer")
async def get_answer(request: GetAnswerRequest):
    """Get the answer and explanation for a specific question"""
    try:
        prompt = f"""For this question: {request.question}
        
        Provide:
        1. The correct answer (be direct and clear)
        2. A detailed explanation why it's correct
        3. Address common misconceptions"""
        
        response = call_ollama(prompt)
        return {"answer": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("Starting ExamGenius FastAPI Backend...")
    print("Make sure Ollama is running: ollama serve")
    print("API will be available at: http://localhost:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)