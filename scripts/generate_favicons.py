import os
from PIL import Image

def generate_favicons():
    source_path = 'public/favicon.png'
    if not os.path.exists(source_path):
        source_path = 'public/favicon-192x192.png'
    
    print(f"Loading base image from: {source_path}")
    img = Image.open(source_path).convert('RGBA')

    # 1. Generate favicon.ico (16x16, 32x32, 48x48)
    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    img.save('public/favicon.ico', format='ICO', sizes=ico_sizes)
    print("✓ Created public/favicon.ico (16x16, 32x32, 48x48)")

    # 2. Generate 48x48 PNG (Google Search recommendation)
    img_48 = img.resize((48, 48), Image.Resampling.LANCZOS)
    img_48.save('public/favicon-48x48.png', format='PNG')
    print("✓ Created public/favicon-48x48.png")

    # 3. Generate 180x180 Apple Touch Icon
    img_180 = img.resize((180, 180), Image.Resampling.LANCZOS)
    img_180.save('public/apple-touch-icon.png', format='PNG')
    print("✓ Created public/apple-touch-icon.png")

    # 4. Generate 192x192 Android / Chrome Icon
    img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save('public/favicon-192x192.png', format='PNG')
    print("✓ Created public/favicon-192x192.png")

    # 5. Generate 512x512 PWA Icon
    img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save('public/favicon-512x512.png', format='PNG')
    print("✓ Created public/favicon-512x512.png")

if __name__ == '__main__':
    generate_favicons()
