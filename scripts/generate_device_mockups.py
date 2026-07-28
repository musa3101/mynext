import os
from PIL import Image, ImageDraw, ImageOps, ImageEnhance, ImageFilter

projects = [
    'blessed-barber-studio',
    'bar-cafeteria-luna-llena',
    'ecuaplac',
    'rbari-restaurant',
    'next-era',
    'mezquita-arrahma',
    'gran-marrakech'
]

# Paths
base_dir = "/Users/musa/Downloads/WEBS mynext Project/RECUPERAR MYNEXT WEB✔️/mynext-V3✔️"
tmp_dir = os.path.join(base_dir, "tmp_screenshots")
portfolio_dir = os.path.join(base_dir, "public/assets/img/portfolio")
favicon_path = os.path.join(base_dir, "public/favicon.png")

# Load favicon for watermark
favicon = Image.open(favicon_path).convert("RGBA")
# Make watermark very subtle (reduce opacity to ~3%)
r, g, b, a = favicon.split()
a = a.point(lambda p: int(p * 0.03)) # 3% opacity
watermark = Image.merge("RGBA", (r, g, b, a)).resize((550, 550), Image.Resampling.LANCZOS)

def create_mockup(slug, index):
    desktop_img_path = os.path.join(tmp_dir, f"{slug}_desktop.png")
    mobile_img_path = os.path.join(tmp_dir, f"{slug}_mobile.png")
    
    if not os.path.exists(desktop_img_path) or not os.path.exists(mobile_img_path):
        print(f"Skipping {slug} due to missing screenshots")
        return
        
    desktop_screenshot = Image.open(desktop_img_path).convert("RGBA")
    mobile_screenshot = Image.open(mobile_img_path).convert("RGBA")
    
    # Create main canvas: 1000x625 (16:10 aspect ratio matching our web view)
    # Start with a very dark background base
    canvas = Image.new("RGBA", (1000, 625), (10, 10, 18, 255))
    
    # 1. Apply a soft left-bottom glow (pink/violet/indigo)
    left_glow = Image.new("RGBA", (1000, 625), (0, 0, 0, 0))
    lg_draw = ImageDraw.Draw(left_glow)
    lg_draw.ellipse([-150, 250, 450, 850], fill=(168, 85, 247, 40)) # Violet/pink glow
    left_glow = left_glow.filter(ImageFilter.GaussianBlur(120))
    canvas = Image.alpha_composite(canvas, left_glow)

    # 2. Apply a soft right-top glow (electric cyan/blue)
    right_glow = Image.new("RGBA", (1000, 625), (0, 0, 0, 0))
    rg_draw = ImageDraw.Draw(right_glow)
    rg_draw.ellipse([650, -150, 1150, 350], fill=(6, 182, 212, 35)) # Cyan glow
    right_glow = right_glow.filter(ImageFilter.GaussianBlur(120))
    canvas = Image.alpha_composite(canvas, right_glow)

    # 3. Apply Watermark in the center
    canvas.paste(watermark, ((1000 - 550) // 2, (625 - 550) // 2), watermark)
    
    # Prepare Draw object for borders/stands
    draw = ImageDraw.Draw(canvas)
    
    # 2. Draw iMac Stand & Base
    # Stand trapezoid: bottom base at Y=540, top at Y=480
    stand_coords = [(450, 480), (550, 480), (570, 550), (430, 550)]
    draw.polygon(stand_coords, fill=(45, 45, 55, 255)) # Silver metallic stand
    draw.ellipse([430, 545, 570, 555], fill=(30, 30, 40, 255)) # Soft stand base shadow
    
    # 3. Draw iMac Screen Bezel & Frame
    # Outer frame coordinates (550 width, 340 height, centered at X=220 to 770, Y=130 to 470)
    frame_coords = [220, 130, 770, 470]
    draw.rounded_rectangle(frame_coords, radius=12, fill=(8, 8, 8, 255), outline=(60, 60, 70, 255), width=2)
    # Bottom silver chin
    draw.rectangle([220, 445, 770, 470], fill=(45, 45, 55, 255))
    # Soft black apple logo spot or camera spot
    draw.ellipse([493, 136, 497, 140], fill=(50, 50, 50, 255)) # camera
    
    # Scale and Crop Desktop Screenshot to fit Screen Area (536 width x 305 height)
    # Screen area coordinates relative to canvas: [227, 137, 763, 442]
    screen_width, screen_height = 536, 305
    desktop_resized = desktop_screenshot.resize((screen_width, int(desktop_screenshot.height * (screen_width / desktop_screenshot.width))), Image.Resampling.LANCZOS)
    # Crop to exact height
    desktop_cropped = desktop_resized.crop((0, 0, screen_width, screen_height))
    canvas.paste(desktop_cropped, (227, 137), desktop_cropped)
    
    # 4. Draw iPhone Mockup (overlaps slightly on the right side)
    # iPhone size: 155 width x 315 height. Position: X=740, Y=230
    phone_x, phone_y = 740, 230
    phone_width, phone_height = 155, 315
    
    # Phone shadow
    draw.ellipse([phone_x - 10, phone_y + phone_height - 10, phone_x + phone_width + 10, phone_y + phone_height + 10], fill=(5, 5, 10, 150))
    
    # Phone outer body (black with thin border)
    draw.rounded_rectangle([phone_x, phone_y, phone_x + phone_width, phone_y + phone_height], radius=24, fill=(5, 5, 5, 255), outline=(50, 50, 60, 255), width=3)
    
    # Scale and Crop Mobile Screenshot to fit Phone Screen Area (145 width x 305 height)
    # Screen area coordinates: X=phone_x + 5, Y=phone_y + 5
    m_screen_width, m_screen_height = 145, 305
    mobile_resized = mobile_screenshot.resize((m_screen_width, int(mobile_screenshot.height * (m_screen_width / mobile_screenshot.width))), Image.Resampling.LANCZOS)
    mobile_cropped = mobile_resized.crop((0, 0, m_screen_width, m_screen_height))
    
    # Round mobile screen corners to match phone body
    mask = Image.new("L", (m_screen_width, m_screen_height), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, m_screen_width, m_screen_height], radius=20, fill=255)
    
    canvas.paste(mobile_cropped, (phone_x + 5, phone_y + 5), mask)
    
    # Draw Dynamic Island
    draw.rounded_rectangle([phone_x + (phone_width // 2) - 20, phone_y + 12, phone_x + (phone_width // 2) + 20, phone_y + 24], radius=6, fill=(5, 5, 5, 255))
    
    # Save final portfolio image
    out_name = f"porfolio{index}.png"
    # Special case: Luna Llena uses porfolio2-v3.png in fallbackData.ts
    if slug == 'bar-cafeteria-luna-llena':
        out_name = "porfolio2-v3.png"
        
    out_path = os.path.join(portfolio_dir, out_name)
    canvas.convert("RGB").save(out_path, "PNG")
    print(f"Generated mockup for {slug} -> {out_name}")

def main():
    print("Starting mockup generation...")
    for i, slug in enumerate(projects, start=1):
        create_mockup(slug, i)
    print("All mockups generated successfully!")

if __name__ == "__main__":
    main()
