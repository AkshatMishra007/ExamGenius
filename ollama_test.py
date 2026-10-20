import requests

def ollama_generate(prompt, model="llama3.1", max_tokens=4096, temperature=0.2):
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": model,
        "prompt": prompt,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "stream": False
    }
    response = requests.post(url, json=payload, timeout=60)
    data = response.json()
    return data["response"]

if __name__ == "__main__":
    prompt = "Generate 5 medium-level multiple choice questions on Python lists without showing answers."
    output = ollama_generate(prompt)
    print("\n--- Model Output ---\n")
    print(output)
