import { jsPDF } from "jspdf";
import { hostnameOf, scoreList, severitySlices } from "../components/audit/chartUtils";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN_X = 48;
const MARGIN_TOP = 64;
const CONTENT_BOTTOM = 780;
const MAX_W = PAGE_W - MARGIN_X * 2;

function sanitize(value) {
  return String(value ?? "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[\u00A0\u202F\u2007\u2009]/g, " ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function breakLongTokens(text) {
  return sanitize(text)
    .split(" ")
    .map((token) => (token.length > 48 ? token.replace(/(.{40})/g, "$1 ") : token))
    .join(" ");
}

function drawSlice(doc, cx, cy, r, a0, a1, rgb) {
  const steps = Math.max(8, Math.ceil((a1 - a0) / 0.1));
  doc.setFillColor(...rgb);
  for (let i = 0; i < steps; i += 1) {
    const t0 = a0 + ((a1 - a0) * i) / steps;
    const t1 = a0 + ((a1 - a0) * (i + 1)) / steps;
    doc.triangle(
      cx,
      cy,
      cx + r * Math.cos(t0),
      cy + r * Math.sin(t0),
      cx + r * Math.cos(t1),
      cy + r * Math.sin(t1),
      "F"
    );
  }
}

function drawDonut(doc, cx, cy, r, rInner, slices) {
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
  let angle = -Math.PI / 2;
  slices.forEach((slice) => {
    if (!slice.value) return;
    const sweep = (slice.value / total) * Math.PI * 2;
    drawSlice(doc, cx, cy, r, angle, angle + sweep, slice.rgb);
    angle += sweep;
  });
  doc.setFillColor(255, 255, 255);
  doc.circle(cx, cy, rInner, "F");
}

class ReportPdf {
  constructor({ host, fetchedAt }) {
    this.doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
    this.host = host;
    this.fetchedAt = fetchedAt;
    this.y = MARGIN_TOP;
    this.drawHeader();
  }

  drawHeader() {
    this.doc.setFillColor(14, 12, 23);
    this.doc.rect(0, 0, PAGE_W, 44, "F");
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text("Website inspection report", MARGIN_X, 20);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.doc.setTextColor(196, 190, 214);
    this.doc.text("Anik Roy  |  Frontend & Webflow  |  Softvence", MARGIN_X, 34);
    this.doc.text(this.host, PAGE_W - MARGIN_X, 20, { align: "right" });
    this.doc.text(this.fetchedAt, PAGE_W - MARGIN_X, 34, { align: "right" });
  }

  drawFooters() {
    const total = this.doc.getNumberOfPages();
    for (let i = 1; i <= total; i += 1) {
      this.doc.setPage(i);
      this.doc.setDrawColor(226, 226, 232);
      this.doc.line(MARGIN_X, 800, PAGE_W - MARGIN_X, 800);
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(8);
      this.doc.setTextColor(120, 120, 128);
      this.doc.text("Confidential  |  Live HTML inspection, not Lighthouse", MARGIN_X, 816);
      this.doc.text(`Page ${i} of ${total}`, PAGE_W - MARGIN_X, 816, { align: "right" });
    }
  }

  newPage() {
    this.doc.addPage();
    this.drawHeader();
    this.y = MARGIN_TOP;
  }

  ensure(height) {
    if (this.y + height <= CONTENT_BOTTOM) return;
    this.newPage();
  }

  lines(text, fontSize = 10) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(fontSize);
    return this.doc.splitTextToSize(breakLongTokens(text), MAX_W);
  }

  heading(text) {
    this.ensure(28);
    this.y += 8;
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(13);
    this.doc.setTextColor(17, 14, 27);
    this.doc.text(sanitize(text), MARGIN_X, this.y);
    this.y += 16;
  }

  paragraph(text, { size = 10, color = [55, 55, 64], bold = false } = {}) {
    if (!text) return;
    this.doc.setFont("helvetica", bold ? "bold" : "normal");
    this.doc.setFontSize(size);
    this.doc.setTextColor(...color);
    const rows = this.lines(text, size);
    const lh = size + 4;
    rows.forEach((row) => {
      this.ensure(lh);
      this.doc.text(row, MARGIN_X, this.y);
      this.y += lh;
    });
    this.y += 4;
  }

  bullets(items) {
    (items || []).filter(Boolean).forEach((item) => {
      const line = typeof item === "string" ? item : item.title;
      this.paragraph(`- ${line}`);
      if (item?.why) this.paragraph(item.why, { size: 9, color: [90, 90, 100] });
      if (item?.where) this.paragraph(`Where: ${item.where}`, { size: 9, color: [90, 90, 180] });
    });
  }

  wrapAt(text, fontSize = 10) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(fontSize);
    return this.doc.splitTextToSize(breakLongTokens(text), MAX_W - 20);
  }

  card(blocks) {
    const prepared = (blocks || [])
      .filter((b) => b?.text)
      .map((line) => ({
        ...line,
        rows: this.wrapAt(line.text, line.size || 10),
      }));
    const lh = 14;
    const pad = 10;
    const innerH = prepared.reduce((n, line) => n + line.rows.length * lh, 0);
    const height = pad * 2 + innerH;
    if (height > CONTENT_BOTTOM - MARGIN_TOP) {
      prepared.forEach((line) => {
        this.paragraph(line.rows.join(" "), {
          size: line.size || 10,
          bold: line.bold,
          color: line.color || [17, 14, 27],
        });
      });
      return;
    }
    this.ensure(height + 8);
    this.doc.setFillColor(248, 247, 252);
    this.doc.setDrawColor(226, 226, 232);
    this.doc.roundedRect(MARGIN_X, this.y, MAX_W, height, 4, 4, "FD");
    let ty = this.y + pad + 10;
    prepared.forEach((line) => {
      this.doc.setFont("helvetica", line.bold ? "bold" : "normal");
      this.doc.setFontSize(line.size || 10);
      this.doc.setTextColor(...(line.color || [17, 14, 27]));
      line.rows.forEach((row) => {
        this.doc.text(row, MARGIN_X + 10, ty);
        ty += lh;
      });
    });
    this.y += height + 8;
  }
}

export function downloadAuditPdf({ crawl, narrative }) {
  const host = hostnameOf(crawl.finalUrl);
  const fetchedAt = new Date(crawl.fetchedAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const pdf = new ReportPdf({ host, fetchedAt });
  const { doc } = pdf;

  pdf.paragraph(crawl.finalUrl, { size: 9, color: [90, 80, 180] });
  pdf.paragraph(narrative.headline, { size: 16, bold: true, color: [17, 14, 27] });

  pdf.ensure(168);
  const chartTop = pdf.y;
  doc.setFillColor(248, 247, 252);
  doc.setDrawColor(226, 226, 232);
  doc.roundedRect(MARGIN_X, chartTop, MAX_W, 158, 6, 6, "FD");

  const slices = severitySlices(crawl.findings);
  if (slices.length) drawDonut(doc, MARGIN_X + 78, chartTop + 82, 54, 32, slices);
  else {
    doc.setFillColor(230, 230, 236);
    doc.circle(MARGIN_X + 78, chartTop + 82, 54, "F");
    doc.setFillColor(255, 255, 255);
    doc.circle(MARGIN_X + 78, chartTop + 82, 32, "F");
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(17, 14, 27);
  doc.text(String(crawl.scores.overall), MARGIN_X + 78, chartTop + 86, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 128);
  doc.text("overall", MARGIN_X + 78, chartTop + 98, { align: "center" });

  let legendY = chartTop + 28;
  doc.setFontSize(9);
  slices.forEach((s) => {
    doc.setFillColor(...s.rgb);
    doc.circle(MARGIN_X + 148, legendY - 3, 4, "F");
    doc.setTextColor(55, 55, 64);
    doc.setFont("helvetica", "normal");
    doc.text(`${s.label}: ${s.value}`, MARGIN_X + 158, legendY);
    legendY += 14;
  });

  const barsX = 330;
  const barsW = PAGE_W - MARGIN_X - barsX;
  scoreList(crawl.scores).forEach((row, i) => {
    const by = chartTop + 28 + i * 24;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 100);
    doc.text(row.label, barsX, by);
    doc.text(String(row.value), barsX + barsW, by, { align: "right" });
    doc.setFillColor(230, 230, 236);
    doc.roundedRect(barsX, by + 4, barsW, 8, 2, 2, "F");
    doc.setFillColor(...row.rgb);
    doc.roundedRect(barsX, by + 4, Math.max(4, (barsW * row.value) / 100), 8, 2, 2, "F");
  });
  pdf.y = chartTop + 172;

  pdf.heading("Executive summary");
  pdf.paragraph(narrative.executiveSummary);

  pdf.heading("What is working");
  pdf.bullets(narrative.whatIsWorking);

  pdf.heading("Do this week");
  pdf.bullets(narrative.roadmap?.now);

  pdf.heading("This month");
  pdf.bullets(narrative.roadmap?.next);

  pdf.heading("After the basics");
  pdf.bullets(narrative.roadmap?.later);

  pdf.heading("Priority work");
  (narrative.priorityWork || []).forEach((item) => {
    pdf.card([
      { text: item.title || "", bold: true, size: 11 },
      ...(item.where ? [{ text: item.where, size: 8, color: [90, 80, 180] }] : []),
      ...(item.why ? [{ text: item.why, size: 9, color: [70, 70, 80] }] : []),
    ]);
  });

  pdf.heading("Observed findings");
  crawl.findings
    .filter((f) => f.severity !== "pass")
    .forEach((f) => {
      pdf.card([
        { text: `${f.severity.toUpperCase()}  |  ${f.area}`, size: 8, color: [120, 120, 128] },
        { text: f.title, bold: true, size: 11 },
        ...(f.evidence ? [{ text: `Evidence: ${f.evidence}`, size: 9, color: [70, 70, 80] }] : []),
        ...(f.recommendation ? [{ text: f.recommendation, size: 9, color: [40, 40, 50] }] : []),
      ]);
    });

  pdf.heading("Pages fetched");
  [
    {
      url: crawl.home.url,
      status: crawl.home.status,
      title: crawl.home.title,
      timingMs: crawl.home.timingMs,
    },
    ...crawl.extraPages,
  ].forEach((p) => {
    pdf.card([
      { text: p.title || p.url, bold: true, size: 10 },
      { text: `HTTP ${p.status || "-"}  |  ${p.timingMs || 0} ms  |  ${p.url}`, size: 8, color: [90, 90, 100] },
    ]);
  });

  pdf.heading("Site notes");
  pdf.paragraph(
    `Stack signals: ${(crawl.home.stack || []).join(", ") || "None detected in HTML"}`
  );
  pdf.paragraph(
    `Homepage ${crawl.home.timingMs} ms, ${Math.round(crawl.home.htmlBytes / 1024)} KB HTML, ${crawl.home.wordCount} words, ${crawl.extraPages.length} extra pages crawled.`
  );
  if (narrative.positioningNotes) pdf.paragraph(narrative.positioningNotes);
  if (narrative.limitations) pdf.paragraph(narrative.limitations, { size: 9, color: [110, 110, 120] });

  pdf.drawFooters();
  const day = new Date(crawl.fetchedAt).toISOString().slice(0, 10);
  doc.save(`site-audit-${host.replace(/[^\w.-]+/g, "-")}-${day}.pdf`);
}
