/**
 * Renders a certificate image onto a <canvas> with a diagonal watermark,
 * and adds mild deterrents against casual copying (right-click, drag, text-select).
 *
 * IMPORTANT (be upfront with yourself about this): none of this prevents a
 * determined person from taking a photo of their screen. The goal is to make a
 * casual screenshot/save look obviously watermarked and low-resolution — not to
 * make copying impossible.
 *
 * Usage: call renderCertificate({ imagePath, watermarkText, canvasId, maxWidth })
 */

function renderCertificate({ imagePath, watermarkText, canvasId, maxWidth = 800 }) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  const img = new Image();

  img.crossOrigin = "anonymous";

  img.onload = () => {
    // Cap resolution: scale down if the source is larger than maxWidth.
    const scale = Math.min(1, maxWidth / img.width);
    const width = img.width * scale;
    const height = img.height * scale;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);
    drawWatermark(ctx, width, height, watermarkText);
  };

  img.onerror = () => {
    const container = canvas.parentElement;
    container.innerHTML =
      '<p class="error">Could not load certificate image. Check the file path.</p>';
  };

  img.src = imagePath;

  // --- Deterrents (mild — see note above) ---
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  canvas.addEventListener("dragstart", (e) => e.preventDefault());
  document.addEventListener("selectstart", (e) => e.preventDefault());
}

function drawWatermark(ctx, width, height, text) {
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#000000";
  ctx.font = `${Math.max(16, width * 0.045)}px sans-serif`;
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 8);

  // Repeat the watermark in a grid so cropping doesn't remove it entirely.
  const stepX = width * 0.6;
  const stepY = height * 0.4;
  for (let y = -height; y < height; y += stepY) {
    for (let x = -width; x < width; x += stepX) {
      ctx.fillText(text, x, y);
    }
  }
  ctx.restore();
}
