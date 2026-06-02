/**
 * utility to apply a watermark to an image using Canvas
 */

export async function applyWatermark(imageSrc: string, text: string = "PSIS SCHOOL"): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Unable to get canvas context"));
        return;
      }

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Setup watermark style
      const padding = 20;
      const fontSize = Math.max(16, Math.floor(img.width / 20));
      ctx.font = `black ${fontSize}px Inter, sans-serif`;
      
      // Calculate position (bottom-right)
      const textMetrics = ctx.measureText(text);
      const x = canvas.width - textMetrics.width - padding;
      const y = canvas.height - padding;

      // Draw semi-transparent background for watermark
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(x - 10, y - fontSize, textMetrics.width + 20, fontSize + 10);

      // Draw text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(text, x, y);

      // Optional: Add a small logo-like circle
      ctx.beginPath();
      ctx.arc(x - 25, y - 10, fontSize / 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();

      // Return as data URL
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = (err) => reject(err);
    img.src = imageSrc;
  });
}
