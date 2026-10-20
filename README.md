# 🧠 ExamGenius - AI-Powered Exam Preparation & Practice Platform

An intelligent, full-stack exam preparation application that generates custom question papers on any subject, provides dynamic AI hints, and delivers detailed explanations. Powered by local LLMs (Ollama / Llama 3.1) and Google Gemini, with vector-search retrieval via Milvus and FAISS.

---

## 🌟 Key Features

- **🎯 Targeted Question Generation**: Create practice papers on any topic (Cloud Computing, AI, Data Structures, etc.) with customizable difficulty (Easy, Medium, Hard) and question counts.
- **💡 Smart Contextual Hints**: Get progressive nudges and hints when you need guidance without revealing the complete solution.
- **📖 Step-by-Step Explanations**: Deep-dive into detailed, AI-generated explanations and key takeaways for every question.
- **⏱️ Interactive Assessment Environment**: Clean exam interface with timers, question progression, bookmarking, and instant grading.
- **📊 Performance Analytics & Scoring**: Visual breakdown of your strengths, time spent, accuracy, and improvement areas using interactive charts.
- **🗄️ Hybrid RAG & Vector Database**: Integrated with Milvus (via Docker Compose) and FAISS for fast similarity search and relevant document retrieval.
- **⚡ Dual AI Support**: Run locally & privately with **Ollama (Llama 3.1)** on your NVIDIA GPU, or connect to **Google Gemini** for cloud-backed inference.

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Animations & Icons**: Lucide React, Framer Motion, Canvas Confetti
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Authentication & Backend Integration**: Supabase client & REST API

### Backend & AI Services
- **FastAPI / Python**: Asynchronous REST API server with automatic OpenAPI docs (`/docs`).
- **Local LLM Engine**: [Ollama](https://ollama.ai/) running `llama3.1` (configured via `Modelfile`).
- **Cloud LLM (Optional)**: Google Gemini API integration.
- **Vector Storage**: [Milvus Standalone](https://milvus.io/) (orchestrated via Docker Compose) & [FAISS](https://github.com/facebookresearch/faiss).

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (3.10+)
- **Ollama** installed ([Download Ollama](https://ollama.ai))
- *(Optional)* **Docker & Docker Compose** (for Milvus vector DB)

---

### 2. Setting Up Ollama (Local AI)
Pull and verify the Llama 3.1 model:

```bash
# Pull Llama 3.1
ollama pull llama3.1

# Serve Ollama (default port: 11434)
ollama serve
```

---

### 3. Setting Up the Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Start Milvus vector database with Docker
docker-compose up -d

# Start the FastAPI server
uvicorn fastapi_backend:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`. You can test endpoints via the interactive Swagger docs at `http://localhost:8000/docs`.

---

### 4. Setting Up the Frontend

In the root project directory:

```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## 📂 Project Structure

```text
├── api/                   # Standalone Python API utilities
├── backend/               # FastAPI backend service
│   ├── fastapi_backend.py # Main FastAPI application & endpoints
│   ├── simple_backend.py  # Lightweight fallback server
│   ├── vector_store.py    # Milvus vector database interface
│   ├── vector_store_faiss.py # FAISS vector database interface
│   └── requirements.txt   # Python backend dependencies
├── ollama_backend/        # Additional Ollama backend handlers
├── public/                # Static web assets
├── src/
│   ├── components/        # React components (Hero, Navbar, QuestionGenerator, etc.)
│   │   └── ui/            # shadcn/ui primitive components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions & API helpers
│   ├── pages/             # App views (Index, Auth, ScorePage, NotFound)
│   └── main.tsx           # Application entry point
├── docker-compose.yml     # Milvus, MinIO, and etcd containers
├── Modelfile              # Custom Ollama model configuration
├── package.json           # Frontend dependencies & scripts
└── README.md
```

---

## 🛡️ License

This project is licensed under the MIT License.
