/**
 * API client for ExamGenius backend
 * Connects to local Ollama-powered backend (FastAPI or Flask)
 */

const API_URL = import.meta.env.VITE_API_URL || "/api";
export interface Question {
  question: string;
  options: string[];
  explanation: string;
  hint: string; // <-- ADD THIS
  id?: number; 
}

export interface GenerateQuestionsResponse {
  success: boolean;
  questions: Question[];
  topic: string;
  difficulty: string;
  count: number;
  error?: string;
}

export interface HintResponse {
  success: boolean;
  hint: string;
  error?: string;
}

export interface AnswerResponse {
  success: boolean;
  answer: string;
  explanation: string;
  error?: string;
}

export interface HealthResponse {
  status: string;
  ollama_connected: boolean;
  available_models?: string[];
  message?: string;
}

/**
 * Generate exam questions using the backend
 */
export async function generateQuestions(
  topic: string,
  difficulty: string,
  count: number
): Promise<GenerateQuestionsResponse> {
  try {
    // Debug: log request details
    console.log("Making API request:", {
      url: `${API_URL}/generate-questions`,
      body: { topic, difficulty, count }
    });

    const response = await fetch(`${API_URL}/generate-questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic, difficulty, count }),
    });

    if (!response.ok) {
      // Try to read JSON body for a helpful error message, fall back to status text
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch (e) {
        /* ignore JSON parse errors */
      }
      // eslint-disable-next-line no-console
      console.debug("generateQuestions response not ok:", response.status, errorBody || response.statusText);
      throw new Error((errorBody && (errorBody.detail || errorBody.error)) || response.statusText || "Failed to generate questions");
    }

    const json = await response.json();
    // eslint-disable-next-line no-console
    console.debug("generateQuestions response:", json);
    return json;
  } catch (error) {
    if (error instanceof Error) {
      // Check if it's a connection error
      if (error.message.includes("fetch")) {
        throw new Error(
          "Cannot connect to backend. Make sure the backend server is running on " + API_URL
        );
      }
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
}

/**
 * Get a hint for a specific question
 */
export async function getHint(question: string): Promise<HintResponse> {
  try {
  const response = await fetch(`${API_URL}/get-hint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.error || "Failed to get hint");
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("fetch")) {
        throw new Error("Cannot connect to backend. Make sure the backend server is running.");
      }
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
}

/**
 * Get the answer and explanation for a question
 */
export async function getAnswer(question: string): Promise<AnswerResponse> {
  try {
  const response = await fetch(`${API_URL}/get-answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.error || "Failed to get answer");
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("fetch")) {
        throw new Error("Cannot connect to backend. Make sure the backend server is running.");
      }
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
}

/**
 * Check backend health and Ollama connection
 */
export async function checkHealth(): Promise<HealthResponse> {
  try {
  const response = await fetch(`${API_URL}/health`, {
      method: "GET",
    });

    if (!response.ok) {
      return {
        status: "unhealthy",
        ollama_connected: false,
        message: "Backend is not responding",
      };
    }

    return await response.json();
  } catch (error) {
    return {
      status: "unhealthy",
      ollama_connected: false,
      message: "Cannot connect to backend",
    };
  }
}
