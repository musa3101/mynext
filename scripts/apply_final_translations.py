import os

translations = {
    # INDEX-EN.HTML
    'Tu presencia digital no es solo una opción, es tu mayor activo.': 'Your digital presence is not just an option, it is your greatest asset.',
    'MI TRABAJO': 'MY WORK',
    '"Musa entendió a la perfección la esencia de nuestro estudio. No solo creó una web visualmente imponente, sino que logró trasladar el lujo y la precisión de cada uno de nuestros cortes al mundo digital. Ha elevado nuestra marca a otro nivel."': '"Musa perfectly understood the essence of our studio. He not only created a visually stunning website, but managed to translate the luxury and precision of each of our cuts into the digital world. He has elevated our brand to another level."',
    'GUSTAVO, DUEÑO': 'GUSTAVO, OWNER',
    'LÍNEA DIRECTA': 'DIRECT LINE',
    'ABRIR WHATSAPP': 'OPEN WHATSAPP',
    'CONSULTAS HQ': 'HQ INQUIRIES',
    'TRANSPARENCIA & RESULTADOS': 'TRANSPARENCY & RESULTS',
    'TRANSPARENCIA &amp; RESULTADOS': 'TRANSPARENCY &amp; RESULTS',
    'PLANES 2026': '2026 PLANS',
    
    # PLANES/INDEX-EN.HTML
    'OFERTA DE LANZAMIENTO - VÁLIDO POR 1 MES': 'LAUNCH OFFER - VALID FOR 1 MONTH',
    'VÁLIDO POR 1 MES': 'VALID FOR 1 MONTH'
}

for fpath in ['index-en.html', 'planes/index-en.html']:
    if os.path.exists(fpath):
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        for es, en in translations.items():
            content = content.replace(es, en)
            
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Final translations applied flawlessly.")
