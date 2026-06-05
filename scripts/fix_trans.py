import os

fpath_idx = 'index-en.html'
if os.path.exists(fpath_idx):
    with open(fpath_idx, 'r', encoding='utf-8') as f:
        idx = f.read()

    trans_idx = {
        'Ver Web &rarr;': 'View Website &rarr;',
        'Ver Web →': 'View Website →',
        'Llevar la esencia y la calidez de nuestro local al entorno digital parecía un reto, pero Musa lo hizo parecer fácil. Diseñó una carta digital impecable y sofisticada que entra por los ojos y refleja fielmente lo que somos.': '"Translating the essence and warmth of our venue to the digital environment seemed like a challenge, but Musa made it look easy. He designed an impeccable and sophisticated digital menu that is eye-catching and faithfully reflects who we are."',
        '¿CONECTAMOS TU SIGUIENTE PASO?<br>DESCÚBRELO ABAJO': 'SHALL WE CONNECT YOUR NEXT STEP?<br>DISCOVER BELOW',
        'Edición Exclusiva Lanzamiento': 'Exclusive Launch Edition',
        'Contáctame ahora para hablar de tu visión y solicitar un presupuesto a medida. Hablemos de tu siguiente paso.': 'Contact me now to discuss your vision and request a custom quote. Let\'s talk about your next step.',
        'Enviar Email &rarr;': 'Send Email &rarr;',
        'Enviar Email →': 'Send Email →',
        'Diseños Exclusivos con Tarifas a Tu Medida': 'Exclusive Designs with Custom Pricing',
        '%C2%A1Hola!%20Vengo%20desde%20la%20web%20de%20MYNEXT.%20Me%20gustar%C3%ADa%20recibir%20informaci%C3%B3n%20sobre%20vuestros%20servicios%20de%20dise%C3%B1o%20y%20arquitectura%20digital%20para%20mi%20negocio.%20%C2%A1Gracias!': 'Hello!%20I%20am%20coming%20from%20the%20MYNEXT%20website.%20I%20would%20like%20to%20receive%20information%20about%20your%20digital%20architecture%20and%20design%20services%20for%20my%20business.%20Thank%20you!',
        'Hola%2C%20Musa.%0A%0AHe%20estado%20revisando%20tu%20porfolio%20en%20MYNEXT%20y%20me%20interesa%20el%20enfoque%20de%20Architecture%20Digital%20para%20mi%20negocio.%20Me%20gustar%C3%ADa%20recibir%20m%C3%A1s%20informaci%C3%B3n%20sobre%20tus%20servicios%20y%20tarifas.%0A%0AUn%20saludo.': 'Hello%20Musa,%0A%0AI%20have%20been%20reviewing%20your%20portfolio%20on%20MYNEXT%20and%20I%20am%20interested%20in%20the%20Digital%20Architecture%20approach%20for%20my%20business.%20I%20would%20like%20to%20receive%20more%20information%20about%20your%20services%20and%20rates.%0A%0ABest%20regards.',
        'Nuevo%20Proyecto%20Digital%20%7C%20MYNEXT': 'New%20Digital%20Project%20%7C%20MYNEXT'
    }

    for es, en in trans_idx.items():
        idx = idx.replace(es, en)

    with open(fpath_idx, 'w', encoding='utf-8') as f:
        f.write(idx)

fpath_pln = 'planes/index-en.html'
if os.path.exists(fpath_pln):
    with open(fpath_pln, 'r', encoding='utf-8') as f:
        pln = f.read()

    trans_pln = {
        'Volver Atrás': 'Go Back',
        'VER PLANES': 'VIEW PLANS',
        'PREGUNTAS FRECUENTES': 'FAQS'
    }
    
    for es, en in trans_pln.items():
        pln = pln.replace(es, en)

    with open(fpath_pln, 'w', encoding='utf-8') as f:
        f.write(pln)

print("Remaining translations applied.")
