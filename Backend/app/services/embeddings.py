_model = None

def get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        print("Loading SentenceTransformer model...")
        _model = SentenceTransformer("BAAI/bge-small-en", device="cpu")
    return _model

def embed_texts(texts: list[str]):
    model = get_model()
    return model.encode(texts, convert_to_numpy=True).tolist()

