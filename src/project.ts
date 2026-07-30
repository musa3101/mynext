import './style.css';
import { fallbackProjects } from './lib/fallbackData';

document.addEventListener('DOMContentLoaded', () => {
    // Determine language from HTML element
    const lang = document.documentElement.lang === 'en' ? 'en' : 'es';

    // Helper to get nested translation
    const getTranslation = (jsonString: string | undefined, lang: string) => {
        if (!jsonString) return '';
        try {
            const parsed = JSON.parse(jsonString);
            return parsed[lang] || parsed['es'] || '';
        } catch (e) {
            return jsonString; // Fallback if not JSON
        }
    };

    // Parse URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    const project = fallbackProjects.find(p => p.slug === slug);

    if (!project) {
        // Handle not found
        document.getElementById('project-title')!.textContent = lang === 'en' ? 'Project Not Found' : 'Proyecto No Encontrado';
        return;
    }

    // Populate data
    const titleEl = document.getElementById('project-title');
    const descEl = document.getElementById('project-description');
    const imageEl = document.getElementById('project-image') as HTMLImageElement;
    const linkEl = document.getElementById('project-link') as HTMLAnchorElement;

    if (titleEl) titleEl.textContent = project.title;
    
    if (descEl) {
        // Use full_description if available, else fallback to description
        const fullDesc = (project as any).full_description 
            ? getTranslation((project as any).full_description, lang) 
            : getTranslation(project.description, lang);
        descEl.innerHTML = fullDesc;
    }
    
    if (imageEl) {
        imageEl.src = project.image_url;
        imageEl.alt = project.title;
    }
    
    if (linkEl) {
        linkEl.href = project.project_url;
    }

    // Populate gallery if available
    const galleryEl = document.getElementById('project-gallery');
    const galleryItems = (project as any).gallery;

    if (galleryEl && galleryItems && galleryItems.length > 0) {
        galleryEl.classList.remove('hidden');
        const defaultTitle = lang === 'en' ? 'PRINT MATERIALS & BRANDING' : 'MATERIALES IMPRESOS & BRANDING';
        const defaultSubtitle = lang === 'en' ? 'Custom print materials & physical QR integration' : 'Materiales impresos y soportes de marca con código QR';

        const sectionTitle = (project as any).gallery_title 
            ? getTranslation((project as any).gallery_title, lang) 
            : defaultTitle;

        const sectionSubtitle = (project as any).gallery_subtitle 
            ? getTranslation((project as any).gallery_subtitle, lang) 
            : defaultSubtitle;

        const itemsHtml = galleryItems.map((item: any) => {
            const itemTitle = getTranslation(item.title, lang);
            const badgeText = lang === 'en' ? 'Print & Branding' : 'Impresión & Branding';
            return `
                <div class="relative group rounded-[2rem] overflow-hidden bg-[#0c0c16]/70 border border-white/10 p-2 hover:border-[#00f2ff]/40 transition-all duration-500 shadow-xl hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,242,255,0.1)]">
                    <div class="w-full aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-black/40 relative">
                        <img src="${item.url}" alt="${itemTitle}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity"></div>
                        <div class="absolute bottom-5 left-5 right-5 z-10">
                            <span class="text-[10px] text-[#00f2ff] font-headline uppercase tracking-widest block mb-1 font-bold">${badgeText}</span>
                            <h3 class="text-sm font-headline font-semibold text-white leading-snug">${itemTitle}</h3>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        galleryEl.innerHTML = `
            <div class="border-t border-white/10 pt-16">
                <div class="mb-10 text-left">
                    <span class="text-[#00f2ff] font-headline text-xs tracking-[0.3em] uppercase mb-2 block font-semibold">${sectionTitle}</span>
                    <h2 class="text-2xl md:text-4xl font-headline font-bold text-white tracking-tight">${sectionSubtitle}</h2>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }
});
