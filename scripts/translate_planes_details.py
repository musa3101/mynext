import os

planes_translations = {
    # Main Title and Tickers
    'PLANES DE DISEÑO WEB': 'WEB DESIGN PLANS',
    'PROFESIONAL Y A MEDIDA': 'PROFESSIONAL & CUSTOM',
    'TRANSFORMA TU WEB HOY Y LIDERA TU SECTOR': 'TRANSFORM YOUR WEB TODAY AND LEAD YOUR SECTOR',
    
    # Bento Grid Cards
    'Todo lo incluido en el Plan Esencial': 'Everything included in the Essential Plan',
    'Optimización SEO Local básica': 'Basic Local SEO Optimization',
    '50€ POR ARREGLO': '50€ PER FIX',
    'INCLUIDOS': 'INCLUDED',
    
    # Footnotes
    '*1 GESTIÓN DE DOMINIO': '*1 DOMAIN MANAGEMENT',
    'El coste de renovación anual del dominio será abonado por el cliente. MYNEXT se encarga de toda la gestión técnica.': 'The annual domain renewal cost will be paid by the client. MYNEXT handles all technical management.',
    '*2 ARREGLOS INCLUIDOS': '*2 INCLUDED FIXES',
    'Cubre modificaciones rápidas (ej. cambiar textos o imágenes, tareas de 15-20 minutos). Si el requerimiento requiere más tiempo de desarrollo, se facturará a 20€/hora.': 'Covers quick modifications (e.g., changing texts or images, 15-20 minute tasks). If the request requires more development time, it will be billed at 20€/hour.',
    '*3 ESTRATEGIA DE PERFIL PRO': '*3 PRO PROFILE STRATEGY',
    'Incluye un estudio profundo del negocio. La web puede extenderse a más de 3 páginas (expansible hasta un tope de 6 páginas) según las necesidades específicas detectadas en cada caso.': 'Includes a deep business analysis. The website can be extended to more than 3 pages (expandable up to a maximum of 6 pages) according to the specific needs detected in each case.',
    
    # Footer and Contact in Planes Page
    'CONSULTORÍA & DISEÑO WEB': 'CONSULTING & WEB DESIGN',
    'LÍNEA DIRECTA': 'DIRECT LINE',
    'Abrir WhatsApp': 'Open WhatsApp',
    'CONSULTAS HQ': 'HQ INQUIRIES',
    'Enviar Email': 'Send Email',
    
    # Double check buttons/headers
    'PLANES 2026': '2026 PLANS'
}

# Apply to planes/index-en.html
planes_file = 'planes/index-en.html'
if os.path.exists(planes_file):
    with open(planes_file, 'r', encoding='utf-8') as f:
        content = f.read()
    for es, en in planes_translations.items():
        content = content.replace(es, en)
    with open(planes_file, 'w', encoding='utf-8') as f:
        f.write(content)

# Apply key ones to index-en.html just in case
index_translations = {
    'TRANSFORMA TU WEB HOY Y LIDERA TU SECTOR': 'TRANSFORM YOUR WEB TODAY AND LEAD YOUR SECTOR',
    'CONSULTORÍA & DISEÑO WEB': 'CONSULTING & WEB DESIGN',
    'LÍNEA DIRECTA': 'DIRECT LINE',
    'Abrir WhatsApp': 'Open WhatsApp',
    'CONSULTAS HQ': 'HQ INQUIRIES',
    'Enviar Email': 'Send Email',
    'PLANES 2026': '2026 PLANS'
}

index_file = 'index-en.html'
if os.path.exists(index_file):
    with open(index_file, 'r', encoding='utf-8') as f:
        content = f.read()
    for es, en in index_translations.items():
        content = content.replace(es, en)
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Planes page and Footers translation patch applied successfully.")
