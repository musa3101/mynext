import os

files_to_fix = ['index.html', 'index-en.html', 'planes/index.html', 'planes/index-en.html']

for f_path in files_to_fix:
    if not os.path.exists(f_path):
        continue
    with open(f_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # If it's already there, remove it to be clean
    if '<!-- Language Toggle -->' in content:
        continue

    # Right nav replacement
    target = 'href="#contacto">Contacto</a>'
    if target in content:
        
        is_en = '-en' in f_path
        
        if is_en:
            if 'planes' in f_path:
                en_link = '<a href="../planes/" class="text-white/60 hover:text-electric-cyan transition-colors">ES</a>\n                    <span class="text-white/30">|</span>\n                    <span class="text-electric-cyan cursor-default">EN</span>'
            else:
                en_link = '<a href="index.html" class="text-white/60 hover:text-electric-cyan transition-colors">ES</a>\n                    <span class="text-white/30">|</span>\n                    <span class="text-electric-cyan cursor-default">EN</span>'
        else:
            if 'planes' in f_path:
                en_link = '<span class="text-electric-cyan cursor-default">ES</span>\n                    <span class="text-white/30">|</span>\n                    <a href="index-en.html" class="text-white/60 hover:text-electric-cyan transition-colors">EN</a>'
            else:
                en_link = '<span class="text-electric-cyan cursor-default">ES</span>\n                    <span class="text-white/30">|</span>\n                    <a href="index-en.html" class="text-white/60 hover:text-electric-cyan transition-colors">EN</a>'
            
        replacement = f'{target}\n                <!-- Language Toggle -->\n                <div class="flex items-center gap-1.5 sm:gap-3 text-[9px] sm:text-[10px] md:text-[11px] font-headline font-bold tracking-[0.1em] md:tracking-[0.2em] ml-2 sm:ml-6">\n                    {en_link}\n                </div>'
        
        content = content.replace(target, replacement)
        
    with open(f_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Toggle fixed.")
