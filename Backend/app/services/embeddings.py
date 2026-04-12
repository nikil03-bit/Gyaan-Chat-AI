import torch

_model = None

def get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        # Check for CUDA (GPU) or fallback to CPU
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading SentenceTransformer model ('BAAI/bge-small-en') on {device}...")
        _model = SentenceTransformer("BAAI/bge-small-en", device=device)
    return _model

def embed_texts(texts: list[str]):
    model = get_model()
    return model.encode(texts, convert_to_numpy=True).tolist()

