from pathlib import Path
from PIL import Image
import shutil
source=Path("C:\\Users\\lucas\\.codex\\generated_images\\01a1e5e0-4388-7f22-be20-0143e43478d9\\exec-02edea7e-2ef4-4f74-bfac-e82051174905.png")
saved=Path('assets/badges-v3/14-grand-arrival-badge.png')
shutil.copy2(source,saved)
im=Image.open(saved)
print(im.size,im.mode,im.getextrema()[-1] if im.mode=='RGBA' else 'no alpha',flush=True)
im.save('public/images/royal-pineapple/badges-v3/14-grand-arrival-badge.full.webp','WEBP',quality=90,method=4)
im.thumbnail((1000,1000),Image.Resampling.LANCZOS)
im.save('public/images/royal-pineapple/badges-v3/14-grand-arrival-badge.webp','WEBP',quality=85,method=4)
