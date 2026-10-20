# ExamGenius Backend

Backend APIs for ExamGenius that integrate with local Ollama (Llama 3.1) for AI-powered question generation.

## Prerequisites

1. **Install Ollama**
   ```bash
   # Visit https://ollama.ai to download and install
   ```

2. **Pull Llama 3.1 model**
   ```bash
   ollama pull llama3.1
   ```

3. **Verify Ollama is running**
   ```bash
   ollama serve
   # Should be accessible at http://localhost:11434
   ```

4. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

## Running the Backend

### Option 1: FastAPI (Recommended)

```bash
# Run with uvicorn
uvicorn fastapi_backend:app --reload --port 8000

# Or run directly
python fastapi_backend.py
```

API will be available at: `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs`

### Option 2: Flask

```bash
python flask_backend.py
```

API will be available at: `http://localhost:5000`

## API Endpoints

### 1. Generate Questions
**POST** `/generate-questions`

```json
{
  "topic": "Cloud Computing",
  "difficulty": "medium",
  "count": 5
}
```

Response:
```json
{
  "success": true,
  "questions": [
    {
      "id": 1,
      "question": "What is the primary benefit of using cloud computing?"
    }
  ],
  "topic": "Cloud Computing",
  "difficulty": "medium",
  "count": 5
}
```

### 2. Get Hint
**POST** `/get-hint`

```json
{
  "question": "What is the primary benefit of using cloud computing?"
}
```

Response:
```json
{
  "success": true,
  "hint": "Think about cost and scalability advantages."
}
```

### 3. Get Answer
**POST** `/get-answer`

```json
{
  "question": "What is the primary benefit of using cloud computing?"
}
```

Response:
```json
{
  "success": true,
  "answer": "Scalability and cost-effectiveness",
  "explanation": "Cloud computing allows organizations to scale resources up or down based on demand, paying only for what they use, which provides significant cost savings compared to maintaining on-premises infrastructure."
}
```

### 4. Health Check
**GET** `/health`

Check if Ollama is connected and see available models.

## Configuration

### Change Model
Edit the `DEFAULT_MODEL` variable in either backend file:
```python
DEFAULT_MODEL = "llama3.1"  # or "llama3.2", "mistral", etc.
```

### Change Port
- **FastAPI**: Change port in the `uvicorn.run()` call
- **Flask**: Change port in the `app.run()` call

## Frontend Integration

Update the React frontend to use this backend:

```typescript
// In src/lib/api.ts or similar
const API_URL = "http://localhost:8000"; // or 5000 for Flask

export async function generateQuestions(topic: string, difficulty: string, count: number) {
  const response = await fetch(`${API_URL}/generate-questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, difficulty, count })
  });
  return response.json();
}
```

## Troubleshooting

### "Cannot connect to Ollama"
- Ensure Ollama is running: `ollama serve`
- Check if accessible: `curl http://localhost:11434/api/tags`

### Model not found
- Pull the model: `ollama pull llama3.1`
- List available models: `ollama list`

### CORS errors
- CORS is enabled for all origins in development
- For production, update `allow_origins` in the CORS middleware

### Slow responses
- First request is always slower (model loading)
- Adjust `temperature` and `num_predict` parameters for faster responses
- Consider using smaller models like `llama3.1:8b`

## Production Notes

- Use environment variables for configuration
- Restrict CORS to your frontend domain
- Add authentication/API keys
- Consider rate limiting
- Use a production ASGI server like Gunicorn with Uvicorn workers
- Monitor Ollama resource usage (GPU/CPU/Memory)
