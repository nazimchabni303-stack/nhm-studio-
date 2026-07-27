import os
import glob
import re

def find_used():
    code_files = []
    for ext in ('*.html', '*.css', '*.js'):
        code_files.extend(glob.glob(f'**/{ext}', recursive=True))
        
    all_content = ""
    for cf in code_files:
        if 'node_modules' in cf or '.git' in cf or 'find_used' in cf or 'check_heavy' in cf or 'optimize' in cf:
            continue
        with open(cf, 'r', encoding='utf-8', errors='ignore') as f:
            all_content += " " + f.read()

    # Find all strings that look like image filenames
    matches = re.findall(r'([a-zA-Z0-9_\-\.\/\\% ]+\.(?:png|PNG|jpg|jpeg|JPG|JPEG|webp|WEBP|svg|SVG))', all_content)
    
    # Normalize and match against actual filesystem
    all_images = []
    for ext in ('*.png', '*.jpg', '*.jpeg', '*.PNG', '*.JPG', '*.JPEG', '*.webp', '*.WEBP'):
        all_images.extend(glob.glob(f'**/{ext}', recursive=True))
    all_images_set = {os.path.normpath(p).lower(): p for p in all_images if '.git' not in p and 'node_modules' not in p}
    
    used_images = set()
    for m in matches:
        m_norm = os.path.normpath(m.strip().strip('\'"()')).lower()
        # Try exact match or suffix match
        if m_norm in all_images_set:
            used_images.add(all_images_set[m_norm])
        else:
            # Try matching basename or partial path
            for path_lower, actual_path in all_images_set.items():
                if m_norm in path_lower or path_lower.endswith(m_norm):
                    used_images.add(actual_path)
                    
    print(f"Total image files on disk: {len(all_images_set)}")
    print(f"Total USED images detected in HTML/CSS/JS: {len(used_images)}")
    
    used_size = sum(os.path.getsize(p) for p in used_images if os.path.exists(p))
    print(f"Total size of USED images: {used_size / 1024 / 1024:.2f} MB")
    
    # Check how many USED images are > 300 KB
    heavy_used = [p for p in used_images if os.path.exists(p) and os.path.getsize(p) > 300 * 1024]
    print(f"USED images > 300 KB: {len(heavy_used)}")
    for p in sorted(heavy_used, key=lambda x: os.path.getsize(x), reverse=True)[:20]:
        print(f"  {os.path.getsize(p)/1024/1024:6.2f} MB : {p}")

if __name__ == '__main__':
    find_used()
