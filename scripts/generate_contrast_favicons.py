import os
from PIL import Image, ImageDraw, ImageOps

def create_premium_favicons():
    print("🎨 Creando Favicons de Alto Contraste para Google Search & Dispositivos...")
    
    # Cargar logo transparente original (1024x1024)
    logo_path = 'public/assets/img/logos/logo-mn-transparent-white.png'
    if not os.path.exists(logo_path):
        logo_path = 'public/favicon.png'
    
    logo_img = Image.open(logo_path).convert('RGBA')
    size = 1024
    
    # 1. Crear lienzo de fondo oscuro profundo de marca (#06060c)
    canvas = Image.new('RGBA', (size, size), (6, 6, 12, 255))
    draw = ImageDraw.Draw(canvas)
    
    # Dibujar un borde sutil y elegante en Cyan Eléctrico (#00F2FF) con radio de 240px
    # Radio de esquina redondeada (Squircle moderno)
    # Fondo con gradiente sutil y logo en color Cyan/Blanco
    
    # Tint logo to Electric Cyan (#00F2FF) & White
    # Extraemos el canal alpha del logo
    r, g, b, alpha = logo_img.split()
    
    # Crear imagen cyan eléctrica
    cyan_fill = Image.new('RGBA', (size, size), (0, 242, 255, 255))
    
    # Ajustar tamaño del logo dentro del canvas con un margen del 18% para perfecta legibilidad en Google Search (16x16px)
    margin = int(size * 0.16)
    target_logo_size = size - (margin * 2)
    
    logo_resized = logo_img.resize((target_logo_size, target_logo_size), Image.Resampling.LANCZOS)
    lr, lg, lb, lalpha = logo_resized.split()
    
    # Colorear el logo con Cyan Eléctrico (#00f2ff)
    cyan_logo = Image.new('RGBA', (target_logo_size, target_logo_size), (0, 242, 255, 255))
    cyan_logo.putalpha(lalpha)
    
    # Pegar el logo centrado en el canvas oscuro
    canvas.paste(cyan_logo, (margin, margin), cyan_logo)
    
    # Guardar Master PNG
    canvas.save('public/favicon.png', format='PNG')
    print("✓ Creado public/favicon.png (1024x1024 Master en Cyan Eléctrico sobre Fondo Oscuro)")

    # 2. Generar 48x48 PNG (Google Search Desktop / Mobile estándar)
    img_48 = canvas.resize((48, 48), Image.Resampling.LANCZOS)
    img_48.save('public/favicon-48x48.png', format='PNG')
    print("✓ Creado public/favicon-48x48.png")

    # 3. Generar 192x192 Android / Google Search HD
    img_192 = canvas.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save('public/favicon-192x192.png', format='PNG')
    print("✓ Creado public/favicon-192x192.png")

    # 4. Generar 512x512 PWA HD Icon
    img_512 = canvas.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save('public/favicon-512x512.png', format='PNG')
    print("✓ Creado public/favicon-512x512.png")

    # 5. Generar 180x180 Apple Touch Icon
    img_180 = canvas.resize((180, 180), Image.Resampling.LANCZOS)
    img_180.save('public/apple-touch-icon.png', format='PNG')
    print("✓ Creado public/apple-touch-icon.png")

    # 6. Generar favicon.ico multi-resolución (16x16, 32x32, 48x48)
    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    canvas.save('public/favicon.ico', format='ICO', sizes=ico_sizes)
    print("✓ Creado public/favicon.ico multi-tamaño")

if __name__ == '__main__':
    create_premium_favicons()
