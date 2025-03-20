export function imageToImageData(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight, {
    colorSpace: 'srgb',
  }).data;
}
