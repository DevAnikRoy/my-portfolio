/**
 * Apple-style Liquid Glass helpers.
 * Real edge refraction via SVG feDisplacementMap (Chromium backdrop-filter: url()).
 * Safari / Firefox / iOS get dark frost fallback — SVG backdrop filters unsupported there.
 */

/** @returns {boolean} */
export function supportsLiquidRefraction() {
  if (typeof navigator === "undefined" || typeof CSS === "undefined" || !CSS.supports) {
    return false;
  }
  const ua = navigator.userAgent;
  // WebKit on iOS never applies SVG filters as backdrop-filter
  if (/iPhone|iPad|iPod/.test(ua)) return false;
  if (/Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua)) return false;
  if (/Firefox\//.test(ua)) return false;
  return (
    /Chrome|Chromium|Edg/.test(ua) && CSS.supports("backdrop-filter", "blur(1px)")
  );
}

/**
 * Signed distance to rounded-rect border (negative = inside).
 * @param {number} px
 * @param {number} py
 * @param {number} hw half-width
 * @param {number} hh half-height
 * @param {number} r corner radius
 */
function sdRoundBox(px, py, hw, hh, r) {
  const ax = Math.abs(px) - hw + r;
  const ay = Math.abs(py) - hh + r;
  const qx = Math.max(ax, 0);
  const qy = Math.max(ay, 0);
  return Math.min(Math.max(ax, ay), 0) + Math.hypot(qx, qy) - r;
}

function smootherstep(t) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

/**
 * Build a displacement map data URL for a rounded glass panel.
 * Center = neutral (128,128). Near the rim, vectors point inward so backdrop
 * content appears to bend along the glass edge (convex lens / Apple liquid glass).
 *
 * @param {{ width: number, height: number, radius?: number, bezel?: number }} opts
 * @returns {{ dataUrl: string, scale: number } | null}
 */
export function createLiquidGlassDisplacementMap({
  width,
  height,
  radius = 22,
  bezel = 18,
}) {
  const w = Math.max(32, Math.round(width));
  const h = Math.max(32, Math.round(height));
  const r = Math.min(radius, Math.min(w, h) / 2 - 1);
  const bezelPx = Math.min(bezel, Math.min(w, h) / 3);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  const img = ctx.createImageData(w, h);
  const data = img.data;
  const hw = w / 2;
  const hh = h / 2;
  const eps = 0.75;

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const px = x + 0.5 - hw;
      const py = y + 0.5 - hh;
      const sd = sdRoundBox(px, py, hw, hh, r);
      const i = (y * w + x) * 4;

      // Outside shape — unused by backdrop clip, keep neutral
      if (sd > 0) {
        data[i] = 128;
        data[i + 1] = 128;
        data[i + 2] = 128;
        data[i + 3] = 255;
        continue;
      }

      const distFromEdge = -sd; // depth inside from border
      if (distFromEdge >= bezelPx) {
        data[i] = 128;
        data[i + 1] = 128;
        data[i + 2] = 128;
        data[i + 3] = 255;
        continue;
      }

      // Outward normal via SDF gradient
      const sdx =
        sdRoundBox(px + eps, py, hw, hh, r) - sdRoundBox(px - eps, py, hw, hh, r);
      const sdy =
        sdRoundBox(px, py + eps, hw, hh, r) - sdRoundBox(px, py - eps, hw, hh, r);
      const len = Math.hypot(sdx, sdy) || 1;
      // Inward for convex glass (pulls backdrop toward center → bend at rim)
      const nx = -sdx / len;
      const ny = -sdy / len;

      // Squircle-ish falloff: strong near rim, soft toward flat center
      const t = 1 - distFromEdge / bezelPx;
      const mag = smootherstep(t);
      // Slight lip: peak just inside the edge
      const lip = mag * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, t * 1.15)));

      data[i] = Math.round(128 + nx * lip * 127);
      data[i + 1] = Math.round(128 + ny * lip * 127);
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  const scale = Math.round(bezelPx * 1.65);
  return {
    dataUrl: canvas.toDataURL("image/png"),
    scale,
    width: w,
    height: h,
  };
}
