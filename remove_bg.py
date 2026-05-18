from PIL import Image
import sys

def process_logo(input_path, output_path):
    try:
        img = Image.open(input_path).convert('RGBA')
        datas = img.getdata()

        newData = []
        for item in datas:
            # Calculate grayscale
            gray = item[0]*0.299 + item[1]*0.587 + item[2]*0.114
            
            # The checkerboard background is usually lighter than the black logo lines.
            if gray > 80:
                # Transparent for background
                newData.append((0, 0, 0, 0))
            else:
                # Black with anti-aliasing alpha
                alpha = int(255 * (1 - gray/80.0))
                newData.append((0, 0, 0, alpha))

        img.putdata(newData)
        img.save(output_path, 'PNG')
        print(f"Successfully processed {input_path} and saved to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    process_logo('nouveaulogo.png', 'nouveaulogo.png')
