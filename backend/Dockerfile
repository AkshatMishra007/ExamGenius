FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy dependencies
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port
ENV PORT=8080

# Run app
CMD ["uvicorn", "fastapi_backend:app", "--host", "0.0.0.0", "--port", "8080"]
