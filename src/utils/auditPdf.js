import { jsPDF } from "jspdf";

function wrap(doc, text, x, y, maxWidth, lineHeight = 5.2) {
  const lines = doc.splitTextToSize(String(text || ""), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "site";
  }
}

export function downloadAuditPdf({ crawl, narrative }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 16;
  const maxW = pageW - margin * 2;
  let y = 18;

  const addPageIfNeeded = (need = 24) => {
    if (y + need < 280) return;
    doc.addPage();
    y = 18;
  };

  doc.setFillColor(14, 12, 23);
  doc.rect(0, 0, pageW, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Website inspection report", margin, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 196, 214);
  doc.text("Prepared by Anik Roy  ·  Frontend & Webflow  ·  Softvence", margin, 21);
  doc.text(new Date(crawl.fetchedAt).toUTCString(), margin, 27);

  y = 42;
  doc.setTextColor(17, 14, 27);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  y = wrap(doc, hostnameOf(crawl.finalUrl), margin, y, maxW, 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 90);
  y = wrap(doc, crawl.finalUrl, margin, y + 1, maxW);
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(120, 115, 245);
  doc.text(String(crawl.scores.overall), margin, y + 8);
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 90);
  doc.text("/ 100 overall  (HTML inspection, not Lighthouse)", margin + 28, y + 6);
  y += 16;

  const scoreLine = `SEO ${crawl.scores.SEO}   Content ${crawl.scores.Content}   Performance ${crawl.scores.Performance}   Accessibility ${crawl.scores.Accessibility}   Security ${crawl.scores.Security}`;
  doc.setFont("helvetica", "normal");
  y = wrap(doc, scoreLine, margin, y, maxW);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(17, 14, 27);
  doc.text("Verdict", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  y = wrap(doc, narrative.headline, margin, y, maxW);
  y += 3;
  y = wrap(doc, narrative.executiveSummary, margin, y, maxW);
  y += 8;

  const section = (title, body) => {
    addPageIfNeeded(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(17, 14, 27);
    doc.text(title, margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 48);
    if (Array.isArray(body)) {
      body.filter(Boolean).forEach((item) => {
        addPageIfNeeded(14);
        y = wrap(doc, `•  ${typeof item === "string" ? item : item.title}`, margin, y, maxW);
        if (item?.why) y = wrap(doc, `   ${item.why}`, margin, y, maxW);
        if (item?.where) y = wrap(doc, `   Where: ${item.where}`, margin, y, maxW);
        y += 2;
      });
    } else {
      y = wrap(doc, body || "—", margin, y, maxW);
    }
    y += 6;
  };

  section("What is working", narrative.whatIsWorking);
  section("Priority work", narrative.priorityWork);
  section("Do this week", narrative.roadmap?.now);
  section("This month", narrative.roadmap?.next);
  section("After the basics", narrative.roadmap?.later);
  section("Offer / copy notes", narrative.positioningNotes);

  addPageIfNeeded(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Observed findings", margin, y);
  y += 7;
  crawl.findings.forEach((f) => {
    addPageIfNeeded(18);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(17, 14, 27);
    y = wrap(doc, `${f.severity.toUpperCase()}  ·  ${f.area}  ·  ${f.title}`, margin, y, maxW);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(70, 70, 80);
    if (f.evidence) y = wrap(doc, `Evidence: ${f.evidence}`, margin, y, maxW);
    if (f.recommendation) y = wrap(doc, f.recommendation, margin, y, maxW);
    y += 4;
  });

  addPageIfNeeded(24);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(17, 14, 27);
  doc.text("Pages fetched", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  [{ url: crawl.home.url, status: crawl.home.status, title: crawl.home.title, timingMs: crawl.home.timingMs }, ...crawl.extraPages].forEach((p) => {
    addPageIfNeeded(10);
    y = wrap(doc, `${p.status || "—"}  ${p.timingMs || 0}ms  ${p.title || ""}  ${p.url}`, margin, y, maxW, 4.6);
    y += 1;
  });

  y += 8;
  addPageIfNeeded(16);
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 120);
  y = wrap(
    doc,
    narrative.limitations ||
      "This inspection fetches live HTML. It does not run Lighthouse, execute client-only routes, or replace a human design review.",
    margin,
    y,
    maxW,
    4.2
  );
  y += 4;
  wrap(doc, "Anik Roy  ·  anikroy302@gmail.com  ·  https://dev-anik.netlify.app", margin, y, maxW, 4.2);

  const host = hostnameOf(crawl.finalUrl).replace(/[^\w.-]+/g, "-");
  const day = new Date(crawl.fetchedAt).toISOString().slice(0, 10);
  doc.save(`site-audit-${host}-${day}.pdf`);
}
