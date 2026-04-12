def chunk_text(text: str, chunk_size=1000, overlap=150):
    """
    Hybrid Paragraph + Size Chunker.
    Splits by paragraphs (double-newlines) first, then ensures chunks 
    don't exceed chunk_size while maintaining semantic cohesion.
    """
    # 1. Split into coarse paragraphs
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = ""

    for p in paragraphs:
        p = p.strip()
        if not p:
            continue

        # If adding this paragraph exceeds limit...
        if len(current_chunk) + len(p) > chunk_size:
            # Save existing chunk if it's not empty
            if current_chunk:
                chunks.append(current_chunk.strip())
            
            # Start new chunk with overlap from previous if possible
            overlap_text = current_chunk[-overlap:] if len(current_chunk) > overlap else ""
            current_chunk = overlap_text + "\n\n" + p if overlap_text else p
            
            # If a SINGLE paragraph is strictly too large, we must force-split it
            while len(current_chunk) > chunk_size:
                chunks.append(current_chunk[:chunk_size].strip())
                current_chunk = current_chunk[chunk_size - overlap:]
        else:
            # Append paragraph to current chunk
            if current_chunk:
                current_chunk += "\n\n" + p
            else:
                current_chunk = p

    # Append the last chunk
    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks

