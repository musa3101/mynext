import React from 'react';
import { createRoot } from 'react-dom/client';
import DoodleCrewFooter from './ui/doodle-crew-footer';

export function mountDoodleCrewFooter(containerId = 'doodle-crew-root') {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Evitar montaje duplicado si ya fue inicializado
  if (container.dataset.mounted === 'true') return;
  container.dataset.mounted = 'true';

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <DoodleCrewFooter
          wordmark="BY MUSA"
          stageOnly={true}
          preset="night"
          palette={{
            background: 'transparent',
            ink: '#ffffff',
            accent: '#00f2ff',
          }}
          fontFamily='"Outfit", "Space Grotesk", "Arial Black", sans-serif'
          doodleCount={14}
          interactive={true}
        />
      </React.StrictMode>
    );
  } catch (err) {
    console.error('Error mounting Doodle Crew Footer:', err);
  }
}
