import fitz  
from docx import Document
from fastapi import UploadFile
import os

async def extract_text(file: UploadFile) -> str:
    """
    Extract text from PDF or DOCX files.
    """

    # Read raw bytes
    file_bytes = await file.read()

    # Detect file extension
    filename = file.filename.lower()

    # ----------- PDF -----------
    if filename.endswith(".pdf"):
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text.strip()
        except Exception as e:
            print("PDF extraction error:", e)
            return ""

    # ----------- DOCX -----------
    if filename.endswith(".docx"):
        try:
            temp_path = "temp_upload.docx"
            with open(temp_path, "wb") as f:
                f.write(file_bytes)

            doc = Document(temp_path)
            text = "\n".join([para.text for para in doc.paragraphs])

            os.remove(temp_path)
            return text.strip()
        except Exception as e:
            print("DOCX extraction error:", e)
            return ""

    # Unsupported format
    return ""
