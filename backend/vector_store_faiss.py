import os
from typing import List, Dict, Optional
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

class VectorStore:
    def __init__(self, collection_name: str = "questions"):
        self.collection_name = collection_name
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.dimension = 384  # all-MiniLM-L6-v2 embedding dimension
        
        # Initialize FAISS index
        self.index = faiss.IndexFlatL2(self.dimension)
        
        # Storage for metadata
        self.questions = []
        self.options = []
        self.explanations = []

    def insert_question(self, question: str, options: List[str], explanation: str):
        """Insert a question into the vector store"""
        # Generate embedding for the question
        embedding = self.model.encode(question)
        
        # Add to FAISS index
        self.index.add(np.array([embedding], dtype=np.float32))
        
        # Store metadata
        self.questions.append(question)
        self.options.append(options)
        self.explanations.append(explanation)
        
        return True

    def search_similar_questions(self, query: str, limit: int = 5) -> List[Dict]:
        """Search for similar questions"""
        if not self.questions:  # If no questions stored yet
            return []
            
        # Generate embedding for the query
        query_embedding = self.model.encode(query)
        
        # Search in FAISS
        distances, indices = self.index.search(
            np.array([query_embedding], dtype=np.float32), 
            min(limit, len(self.questions))
        )
        
        # Format results
        similar_questions = []
        for i, (dist, idx) in enumerate(zip(distances[0], indices[0])):
            if idx < len(self.questions):  # Ensure valid index
                similar_questions.append({
                    "question": self.questions[idx],
                    "options": self.options[idx],
                    "explanation": self.explanations[idx],
                    "similarity": float(1 / (1 + dist))  # Convert distance to similarity score
                })
        
        return similar_questions