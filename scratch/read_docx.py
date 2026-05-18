import zipfile
import xml.etree.ElementTree as ET
import os

docx_path = r"D:\ktltcp\public\pdf\example\ขอเชิญประชุมคณะทำงานงานศูนย์ข้อมูลและสารสนเทศ.docx"

if not os.path.exists(docx_path):
    print(f"File not found: {docx_path}")
    exit(1)

try:
    with zipfile.ZipFile(docx_path) as z:
        xml_content = z.read('word/document.xml')
        root = ET.fromstring(xml_content)
        
        # Namespaces
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        paragraphs = []
        for paragraph in root.findall('.//w:p', ns):
            texts = [node.text for node in paragraph.findall('.//w:t', ns) if node.text]
            if texts:
                paragraphs.append("".join(texts))
        
        print("\n".join(paragraphs))
except Exception as e:
    print(f"Error reading docx: {e}")
