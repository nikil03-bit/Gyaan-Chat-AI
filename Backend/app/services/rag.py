def build_prompt(context_chunks: list[str], question: str) -> str:
    # Limit context to max 6000 chars to keep token usage low and responses fast
    context = ""
    for chunk in context_chunks:
        if len(context) + len(chunk) > 6000:
            break
        context += chunk + "\n\n"
    
    context = context.strip()

    return f"""
You are a professional customer support assistant for this website.

Rules:
- Answer ONLY using the context below
- Be clear, concise, and professional
- Do not guess or add extra information
- If the answer is not in the context, reply:
  "I couldn’t find this information in the provided documents."

Context:
{context}

Question:
{question}

Answer:
""".strip()

