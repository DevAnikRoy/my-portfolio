export const SCORE_KEYS = [
  { key: "SEO", label: "SEO", color: "#7873F5", rgb: [120, 115, 245] },
  { key: "Content", label: "Content", color: "#EC77AB", rgb: [236, 119, 171] },
  { key: "Performance", label: "Performance", color: "#34D399", rgb: [52, 211, 153] },
  { key: "Accessibility", label: "Accessibility", color: "#FBBF24", rgb: [251, 191, 36] },
  { key: "Security", label: "Security", color: "#60A5FA", rgb: [96, 165, 250] },
];

export const SEVERITY_META = {
  critical: { label: "Critical", color: "#F87171", rgb: [248, 113, 113] },
  high: { label: "High", color: "#EC77AB", rgb: [236, 119, 171] },
  medium: { label: "Medium", color: "#FBBF24", rgb: [251, 191, 36] },
  low: { label: "Low", color: "#A1A1AA", rgb: [161, 161, 170] },
  pass: { label: "Pass", color: "#34D399", rgb: [52, 211, 153] },
};

export function scoreList(scores) {
  return SCORE_KEYS.map((item) => ({
    ...item,
    value: Number(scores?.[item.key] ?? 0),
  }));
}

export function severitySlices(findings = []) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, pass: 0 };
  findings.forEach((f) => {
    if (counts[f.severity] != null) counts[f.severity] += 1;
  });
  return Object.entries(SEVERITY_META)
    .map(([key, meta]) => ({ key, ...meta, value: counts[key] }))
    .filter((s) => s.value > 0);
}

export function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "site";
  }
}

export function polarToCart(cx, cy, r, angle) {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

export function donutPaths(slices, cx, cy, rOuter, rInner) {
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
  let angle = -Math.PI / 2;
  return slices.map((slice) => {
    const sweep = (slice.value / total) * Math.PI * 2;
    const a1 = angle + sweep;
    const large = sweep > Math.PI ? 1 : 0;
    const [x0, y0] = polarToCart(cx, cy, rOuter, angle);
    const [x1, y1] = polarToCart(cx, cy, rOuter, a1);
    const [x2, y2] = polarToCart(cx, cy, rInner, a1);
    const [x3, y3] = polarToCart(cx, cy, rInner, angle);
    const d = [
      `M ${x0} ${y0}`,
      `A ${rOuter} ${rOuter} 0 ${large} 1 ${x1} ${y1}`,
      `L ${x2} ${y2}`,
      `A ${rInner} ${rInner} 0 ${large} 0 ${x3} ${y3}`,
      "Z",
    ].join(" ");
    angle = a1;
    return { ...slice, d };
  });
}
