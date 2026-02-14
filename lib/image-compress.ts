/**
 * Tarayıcıda görseli yeniden boyutlandırıp sıkıştırır (S3 boyutunu düşürür).
 * Max genişlik 1200px, JPEG kalitesi 0.82.
 */

const MAX_WIDTH = 1200;
const JPEG_QUALITY = 0.82;

export async function compressImageForUpload(file: File): Promise<{ blob: Blob; contentType: string }> {
  if (!file.type.startsWith('image/')) {
    return { blob: file, contentType: file.type };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > MAX_WIDTH) {
        height = (height * MAX_WIDTH) / width;
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ blob: file, contentType: file.type });
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, contentType: 'image/jpeg' });
          } else {
            resolve({ blob: file, contentType: file.type });
          }
        },
        'image/jpeg',
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ blob: file, contentType: file.type });
    };

    img.src = url;
  });
}
