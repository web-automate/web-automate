// Helper untuk mengonversi HEX ke HSL
const hexToHsl = (hex: string) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

// Helper untuk mengonversi HSL kembali ke HEX
const hslToHex = (h: number, s: number, l: number) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Fungsi Utama Color Theory
const getHarmonyColor = (primaryHex: string, type: string) => {
  const { h, s, l } = hexToHsl(primaryHex);
  let newHue = h;

  switch (type) {
    case 'complementary':
      newHue = (h + 180) % 360; // Berseberangan 180 derajat
      break;
    case 'analogous':
      newHue = (h + 30) % 360;  // Berdekatan 30 derajat
      break;
    case 'triadic':
      newHue = (h + 120) % 360; // Membentuk segitiga 120 derajat
      break;
    default:
      return primaryHex;
  }
  return hslToHex(newHue, s, l);
};

export { getHarmonyColor };
