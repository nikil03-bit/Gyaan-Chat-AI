from PyPDF2 import PdfReader

def extract_text_from_pdf(file_path: str) -> str:
    try:
        reader = PdfReader(file_path)
        text = ""

        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                page_text = page_text.replace("■", "₹")
                text += page_text + "\n"

        extracted_text = text.strip()
        print(f"[DEBUG] PDF Extracted {len(extracted_text)} chars from {file_path}")
        return extracted_text
    except Exception as e:
        print(f"[ERROR] PDF Extraction failed for {file_path}: {e}")
        return ""

