import os
from typing import List, Dict, Optional
from pymilvus import (
    connections,
    Collection,
    FieldSchema,
    CollectionSchema,
    DataType,
    utility
)
from sentence_transformers import SentenceTransformer

class VectorStore:
    def __init__(self, collection_name: str = "questions"):
        self.collection_name = collection_name
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Connect to Milvus
        self._connect()
        if utility.has_collection(self.collection_name):
            utility.drop_collection(self.collection_name)
            print(f"Dropped old collection '{self.collection_name}' to apply schema changes.")
        # Create collection if it doesn't exist
        self._create_collection()

    def _connect(self):
        """Connect to Milvus server"""
        connections.connect(
            alias="default",
            host="localhost",
            port="19530"
        )

    def _create_collection(self):
        """Create a collection if it doesn't exist"""
        if utility.has_collection(self.collection_name):
            self.collection = Collection(self.collection_name)
            return

        # Define fields for the collection
        fields = [
            FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
            FieldSchema(name="question", dtype=DataType.VARCHAR, max_length=2000),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=384),
            FieldSchema(name="options", dtype=DataType.ARRAY, element_type=DataType.VARCHAR, max_length=1000, max_capacity=10),
            FieldSchema(name="explanation", dtype=DataType.VARCHAR, max_length=2000),
            FieldSchema(name="hint", dtype=DataType.VARCHAR, max_length=1000) # <-- ADD THIS LINE
    ]
# ...
    
# ...
        
        
        schema = CollectionSchema(fields=fields, description="Question bank")
        self.collection = Collection(name=self.collection_name, schema=schema)
        
        # Create an IVF_FLAT index for the embedding field
        index_params = {
            "metric_type": "L2",
            "index_type": "IVF_FLAT",
            "params": {"nlist": 128}
        }
        self.collection.create_index(field_name="embedding", index_params=index_params)

    def insert_question(self, question: str, options: List[str], explanation: str, hint: str):
        """Insert a question into the vector store"""
        
        # 1. Generate embedding and convert to a standard list[float]
        embedding = self.model.encode(question).tolist()

        # 2. Create a "row-based" entity (a dictionary).
        # The keys MUST match your schema field names exactly.
        data = [
    {
        "question": question,
        "embedding": embedding,
        "options": options,
        "explanation": explanation,
        "hint": hint  # <-- ADD THIS LINE
    }
]
        
        # 3. Insert the list containing the row
        # This is the clear, row-based insert method.
        self.collection.insert(data)
        
        return True

    def search_similar_questions(self, query: str, limit: int = 5) -> List[Dict]:
        """Search for similar questions"""
        # Generate embedding for the query
        query_embedding = self.model.encode(query)
        
        # Load collection and search
        self.collection.load()
        
        search_params = {
            "metric_type": "L2",
            "params": {"nprobe": 10}
        }
        
        results = self.collection.search(
            data=[query_embedding.tolist()],
            anns_field="embedding",
            param=search_params,
            limit=limit,
            output_fields=["question", "options", "explanation"]
        )

        # Format results
        similar_questions = []
        for hits in results:
            for hit in hits:
                similar_questions.append({
                    "question": hit.entity.get('question'),
                    "options": hit.entity.get('options'),
                    "explanation": hit.entity.get('explanation'),
                    "similarity": hit.distance
                })

        return similar_questions

    def __del__(self):
        """Cleanup connection when object is destroyed"""
        try:
            connections.disconnect("default")
        except:
            pass