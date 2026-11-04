from pathlib import Path
from pdf2image import convert_from_path
from PIL import Image, ImageOps, ImageDraw

root = Path('D:/Projects/Shyft/tmp/security-audit-2026-10-30/render')
poppler = 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1029-1117-0_26.1029.1117.0_x64__3k8sg7r9htsxt/dependencies/native/poppler/Library/bin'
pages = convert_from_path(str(root / 'RocketRota_Security_Audit_2026-10-30.pdf'), dpi=120, poppler_path=poppler)
thumbs = []
for index, page in enumerate(pages, 1):
    page.save(root / f'page-{index}.png')
    thumbnail = ImageOps.contain(page, (310, 440))
    tile = Image.new('RGB', (330, 470), '#D8DEE5')
    tile.paste(thumbnail, ((330-thumbnail.width)//2, 8))
    ImageDraw.Draw(tile).text((12, 450), f'Page {index}', fill='black')
    thumbs.append(tile)
montage = Image.new('RGB', (330*3, 470*((len(thumbs)+2)//3)), 'white')
for index, tile in enumerate(thumbs):
    montage.paste(tile, ((index%3)*330, (index//3)*470))
montage.save(root / 'contact-sheet.png')
print(f'Rendered {len(pages)} page images')
