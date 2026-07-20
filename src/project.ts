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
});
