from pathlib import Path
import re
import zipfile


def extract_docx_text(file_path: str) -> str:
    path = Path(file_path)
    if not path.exists():
        return ''
    try:
        import docx
    except Exception:
        # Fallback parser without python-docx dependency.
        return _extract_docx_via_xml(path)

    try:
        document = docx.Document(str(path))
    except Exception:
        return ''

    lines = [paragraph.text.strip() for paragraph in document.paragraphs if paragraph.text.strip()]
    return '\n'.join(lines).strip()


def _extract_docx_via_xml(path: Path) -> str:
    try:
        with zipfile.ZipFile(path, 'r') as archive:
            xml = archive.read('word/document.xml').decode('utf-8', errors='ignore')
    except Exception:
        return ''
    xml = re.sub(r'</w:p>', '\n', xml)
    text = re.sub(r'<[^>]+>', ' ', xml)
    return re.sub(r'\s+', ' ', text).strip()
