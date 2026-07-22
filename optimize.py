import os
import re
import glob
from PIL import Image

def optimize_images():
    html_files = glob.glob('*.html')
    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Find all src="" containing local images
        matches = re.findall(r'src="([^"]+\.(?:png|PNG|jpg|jpeg|JPG|JPEG))"', content)
        
        changed = False
        for img_path in set(matches):
            if not os.path.exists(img_path):
                continue
                
            file_size = os.path.getsize(img_path)
            # Only optimize images > 500KB
            if file_size > 500 * 1024:
                print(f"Optimizing: {img_path} ({file_size/1024/1024:.2f} MB)")
                
                # New webp path
                base, _ = os.path.splitext(img_path)
                webp_path = base + ".webp"
                
                try:
                    with Image.open(img_path) as img:
                        # Convert to RGB if RGBA
                        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                            bg = Image.new("RGB", img.size, (255, 255, 255))
                            if img.mode == 'RGBA':
                                bg.paste(img, mask=img.split()[3])
                            else:
                                bg.paste(img)
                            img = bg
                        
                        # Resize if very large
                        max_width = 1600
                        if img.width > max_width:
                            ratio = max_width / img.width
                            new_size = (max_width, int(img.height * ratio))
                            img = img.resize(new_size, Image.Resampling.LANCZOS)
                        
                        img.save(webp_path, 'webp', quality=80)
                        
                    # Replace in HTML
                    content = content.replace(f'src="{img_path}"', f'src="{webp_path}"')
                    changed = True
                    print(f"  -> Saved as {webp_path}")
                except Exception as e:
                    print(f"Failed to optimize {img_path}: {e}")
                    
        if changed:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated HTML: {html_file}")

if __name__ == "__main__":
    optimize_images()
