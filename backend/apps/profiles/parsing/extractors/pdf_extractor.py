from pathlib import Path


def extract_pdf_text(file_path: str) -> str:
    path = Path(file_path)
    if not path.exists():
        return ''
    PdfReader = None
    try:
        from pypdf import PdfReader as _PdfReader
        PdfReader = _PdfReader
    except Exception:
        try:
            from PyPDF2 import PdfReader as _PdfReader
            PdfReader = _PdfReader
        except Exception:
            return ''

    text_parts: list[str] = []
    try:
        reader = PdfReader(str(path))
        for page in reader.pages:
            text_parts.append(page.extract_text() or '')
    except Exception:
        return ''
    return '\n'.join(text_parts).strip()
