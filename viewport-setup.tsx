import { useEffect } from 'react';

// Component to set up viewport and device compatibility meta tags
export function ViewportSetup() {
  useEffect(() => {
    // Set viewport meta tag for mobile optimization
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover');

    // Set theme color for mobile browsers
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute('content', '#4FD1C7'); // Teal primary color

    // Add apple-mobile-web-app meta tags for iOS
    const appleMetas = [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: 'NEKAH' }
    ];

    appleMetas.forEach(({ name, content }) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    // Add Microsoft tile configuration
    let msTileColorMeta = document.querySelector('meta[name="msapplication-TileColor"]');
    if (!msTileColorMeta) {
      msTileColorMeta = document.createElement('meta');
      msTileColorMeta.setAttribute('name', 'msapplication-TileColor');
      document.head.appendChild(msTileColorMeta);
    }
    msTileColorMeta.setAttribute('content', '#4FD1C7');

    // Prevent zooming issues on iOS
    document.addEventListener('gesturestart', (e) => {
      e.preventDefault();
    });

    document.addEventListener('gesturechange', (e) => {
      e.preventDefault();
    });

    document.addEventListener('gestureend', (e) => {
      e.preventDefault();
    });
  }, []);

  return null; // This component doesn't render anything
}