import os
import glob

def check_images():
    extensions = ('*.png', '*.jpg', '*.jpeg', '*.PNG', '*.JPG', '*.JPEG')
    image_files = []
    for ext in extensions:
        image_files.extend(glob.glob(f'**/{ext}', recursive=True))
    
    heavy_files = []
    total_size = 0
    for img in image_files:
        if '.git' in img or 'node_modules' in img:
            continue
        try:
            size = os.path.getsize(img)
            total_size += size
            if size > 300 * 1024: # > 300 KB
                heavy_files.append((size, img))
        except Exception as e:
            pass
            
    heavy_files.sort(reverse=True)
    print(f"Total image files scanned: {len(image_files)}")
    print(f"Total size of all images: {total_size / 1024 / 1024:.2f} MB")
    print(f"Images > 300 KB: {len(heavy_files)}")
    print("\nTop 15 heaviest images:")
    for size, img in heavy_files[:15]:
        print(f"  {size/1024/1024:6.2f} MB : {img}")

if __name__ == '__main__':
    check_images()
