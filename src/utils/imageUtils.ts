/**
 * Utility functions for handling and optimizing image uploads from device gallery
 */

/**
 * Reads an image File from device gallery and compresses it using an HTML5 Canvas,
 * returning a lightweight, high-resolution Base64 data URL.
 */
export async function fileToOptimizedDataUrl(
  file: File,
  maxWidth = 1200,
  maxHeight = 1600,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen'));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo de la galería'));
    };

    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== 'string') {
        reject(new Error('No se pudo procesar la imagen'));
        return;
      }

      // If it's a small GIF or SVG, don't re-compress on canvas
      if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
        resolve(result);
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate aspect ratio scaling
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to original
            resolve(result);
            return;
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Export as JPEG with chosen quality
          const optimized = canvas.toDataURL('image/jpeg', quality);
          resolve(optimized);
        } catch (err) {
          // If canvas tainted or fails, fallback to original read
          resolve(result);
        }
      };

      img.onerror = () => {
        // Fallback to raw data url
        resolve(result);
      };

      img.src = result;
    };

    reader.readAsDataURL(file);
  });
}
