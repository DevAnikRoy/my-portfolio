#!/usr/bin/env python3
"""Generate Anik Roy's one-page resume PDF."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor, white
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

OUT = "/Users/anikroy/Idea/my-portfolio/public/resume.pdf"

INK = HexColor("#110E1B")
ACCENT = HexColor("#7873F5")
MUTED = HexColor("#5A5866")
BODY = HexColor("#2B2836")
RULE = HexColor("#E4E0EE")

PAGE_W, PAGE_H = letter
ML, MR = 0.58 * inch, 0.58 * inch
CONTENT_W = PAGE_W - ML - MR


def wrap(c, text, font, size, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if c.stringWidth(test, font, size) <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def section_title(c, y, title):
    c.setFont("Times-Bold", 10.5)
    c.setFillColor(INK)
    c.drawString(ML, y, title.upper())
    tw = c.stringWidth(title.upper(), "Times-Bold", 10.5)
    c.setStrokeColor(ACCENT)
    c.setLineWidth(1.6)
    c.line(ML, y - 4, ML + max(tw, 92), y - 4)
    c.setStrokeColor(RULE)
    c.setLineWidth(0.4)
    c.line(ML + max(tw, 92) + 8, y - 4, PAGE_W - MR, y - 4)
    return y - 16


def bullet(c, y, text, indent=10):
    max_w = CONTENT_W - indent - 10
    lines = wrap(c, text, "Times-Roman", 9.4, max_w)
    c.setFillColor(ACCENT)
    c.circle(ML + 3.5, y + 2.4, 1.35, fill=1, stroke=0)
    c.setFillColor(BODY)
    c.setFont("Times-Roman", 9.4)
    for i, line in enumerate(lines):
        c.drawString(ML + indent, y - i * 12.2, line)
    return y - (len(lines) * 12.2) - 4.2


def job_header(c, y, role, dates, company, place):
    c.setFont("Times-Bold", 10.5)
    c.setFillColor(INK)
    c.drawString(ML, y, role)
    c.setFont("Times-Italic", 9)
    c.setFillColor(MUTED)
    c.drawRightString(PAGE_W - MR, y, dates)
    y -= 13
    c.setFont("Times-Bold", 9.5)
    c.setFillColor(ACCENT)
    c.drawString(ML, y, company)
    c.setFont("Times-Italic", 9)
    c.setFillColor(MUTED)
    c.drawRightString(PAGE_W - MR, y, place)
    return y - 14


def link_text(c, x, y, label, url, font="Times-Roman", size=8.4, color=HexColor("#4A46B8")):
    c.setFont(font, size)
    c.setFillColor(color)
    w = c.stringWidth(label, font, size)
    c.drawString(x, y, label)
    c.linkURL(url, (x, y - 1.5, x + w, y + size), relative=0)
    return w


def main():
    c = canvas.Canvas(OUT, pagesize=letter)
    c.setTitle("Anik Roy — Frontend & Webflow Developer")
    c.setAuthor("Anik Roy")
    c.setSubject("Resume")

    # Header
    header_h = 92
    c.setFillColor(INK)
    c.rect(0, PAGE_H - header_h, PAGE_W, header_h, fill=1, stroke=0)
    c.setFillColor(ACCENT)
    c.rect(0, PAGE_H - header_h - 3.5, PAGE_W, 3.5, fill=1, stroke=0)

    c.setFillColor(white)
    c.setFont("Times-Bold", 26)
    c.drawString(ML, PAGE_H - 36, "ANIK ROY")
    c.setFont("Times-Italic", 11.5)
    c.setFillColor(HexColor("#C9C4E8"))
    c.drawString(ML, PAGE_H - 54, "Frontend & Webflow Developer")

    contacts = [
        ("Dhaka, Bangladesh", None),
        ("+8801722718821", "tel:+8801722718821"),
        ("anikroy302@gmail.com", "mailto:anikroy302@gmail.com"),
        ("dev-anik.netlify.app", "https://dev-anik.netlify.app"),
        ("GitHub", "https://github.com/DevAnikRoy"),
        ("LinkedIn", "https://www.linkedin.com/in/anik-roy-2171621b3/"),
    ]
    x = ML
    y = PAGE_H - 74
    c.setFont("Times-Roman", 8.3)
    for i, (label, url) in enumerate(contacts):
        if i:
            c.setFillColor(HexColor("#8B86B0"))
            c.drawString(x, y, "  ·  ")
            x += c.stringWidth("  ·  ", "Times-Roman", 8.3)
        if url:
            w = link_text(c, x, y, label, url, size=8.3, color=HexColor("#EDEAF8"))
        else:
            c.setFillColor(HexColor("#EDEAF8"))
            c.setFont("Times-Roman", 8.3)
            c.drawString(x, y, label)
            w = c.stringWidth(label, "Times-Roman", 8.3)
        x += w

    y = PAGE_H - header_h - 22

    y = section_title(c, y, "Summary")
    summary = (
        "Frontend and Webflow developer with 2 years of experience shipping production websites "
        "and web apps. I build React interfaces and CMS-driven Webflow sites for international "
        "clients, with a focus on performance, responsive UI, and clean handoff after launch."
    )
    c.setFillColor(BODY)
    c.setFont("Times-Roman", 9.6)
    for line in wrap(c, summary, "Times-Roman", 9.6, CONTENT_W):
        c.drawString(ML, y, line)
        y -= 12.8
    y -= 8

    y = section_title(c, y, "Experience")
    y = job_header(
        c, y,
        "Frontend & Webflow Developer",
        "July 2025 – Present",
        "Softvence",
        "Sheridan, WY · Remote",
    )
    for t in [
        "Built and maintained responsive Webflow websites for international clients, including CMS collections, interactions, and SEO-ready pages.",
        "Translated Figma designs into production UI in Webflow and in React with Tailwind CSS.",
        "Shipped reusable React components for custom product work outside Webflow.",
        "Optimized performance, accessibility, and client handoff for production launches.",
    ]:
        y = bullet(c, y, t)
    y -= 6

    y = job_header(
        c, y,
        "Frontend Developer",
        "2024 – 2025",
        "Freelance / Client Projects",
        "Dhaka, Bangladesh",
    )
    for t in [
        "Delivered React and CMS websites for businesses and NGOs, from requirements through deployment.",
        "Built full-stack apps with React, Firebase, Node.js, and MongoDB, including auth, REST APIs, and mobile-first UI.",
    ]:
        y = bullet(c, y, t)
    y -= 8

    y = section_title(c, y, "Selected Projects")

    c.setFont("Times-Bold", 9.6)
    c.setFillColor(INK)
    c.drawString(ML, y, "Webflow")
    y -= 13
    webflow = [
        ("ApnaKey Partner", "Host marketplace site — listings, bookings, and payouts.", "https://apnakey-partner.webflow.io/"),
        ("Human Studio", "Cape Town creative studio — web, branding, and content.", "https://human-studio-website.webflow.io/"),
        ("Airborne Solutions", "Aircraft sales, ferry flights, and fleet management.", "https://airborne-v2.webflow.io/"),
        ("HouseMax Funding", "Hard-money lender — DSCR, fix & flip, and construction loans.", "https://house-max-funding.webflow.io/"),
        ("Between", "Norwegian field-service OS — sales, planning, and invoicing.", "https://between-new.webflow.io/"),
    ]
    for name, desc, url in webflow:
        c.setFillColor(ACCENT)
        c.circle(ML + 3.5, y + 2.4, 1.35, fill=1, stroke=0)
        c.setFont("Times-Bold", 9.3)
        c.setFillColor(INK)
        c.drawString(ML + 10, y, name)
        nw = c.stringWidth(name, "Times-Bold", 9.3)
        c.setFont("Times-Roman", 9.3)
        c.setFillColor(BODY)
        c.drawString(ML + 10 + nw, y, "  —  " + desc)
        live = "Live"
        lw = c.stringWidth(live, "Times-Italic", 8.5)
        link_text(c, PAGE_W - MR - lw, y, live, url, font="Times-Italic", size=8.5)
        y -= 13.2

    y -= 4
    c.setFont("Times-Bold", 9.6)
    c.setFillColor(INK)
    c.drawString(ML, y, "React")
    y -= 13
    react = [
        ("Garden Hub", "E-commerce marketplace with auth, payments, and an admin dashboard.", "https://garden-hub-53195.web.app/"),
        ("ServiceHub", "Service booking platform for users and providers.", "https://service-assignment-f070a.web.app/"),
        ("AppStore Platform", "SPA for browsing, installing, and reviewing apps.", "https://thriving-hamster-fc7ee4.netlify.app/"),
    ]
    for name, desc, url in react:
        c.setFillColor(ACCENT)
        c.circle(ML + 3.5, y + 2.4, 1.35, fill=1, stroke=0)
        c.setFont("Times-Bold", 9.3)
        c.setFillColor(INK)
        c.drawString(ML + 10, y, name)
        nw = c.stringWidth(name, "Times-Bold", 9.3)
        c.setFont("Times-Roman", 9.3)
        c.setFillColor(BODY)
        c.drawString(ML + 10 + nw, y, "  —  " + desc)
        live = "Live"
        lw = c.stringWidth(live, "Times-Italic", 8.5)
        link_text(c, PAGE_W - MR - lw, y, live, url, font="Times-Italic", size=8.5)
        y -= 13.2
    y -= 8

    y = section_title(c, y, "Skills")
    skills = [
        ("Frontend", "React, JavaScript (ES6+), TypeScript, Next.js, Tailwind CSS, HTML5, CSS3, GSAP"),
        ("Webflow", "CMS, Interactions, Responsive builds, SEO, Client handoff"),
        ("Backend", "Node.js, Express, MongoDB, Firebase, REST APIs"),
        ("Tools", "Git, Figma, Vite, Netlify, Firebase Hosting, Cursor"),
    ]
    label_w = 62
    for label, items in skills:
        c.setFont("Times-Bold", 9.2)
        c.setFillColor(INK)
        c.drawString(ML, y, label)
        c.setFont("Times-Roman", 9.2)
        c.setFillColor(BODY)
        c.drawString(ML + label_w, y, items)
        y -= 13
    y -= 6

    y = section_title(c, y, "Education")
    c.setFont("Times-Bold", 10)
    c.setFillColor(INK)
    c.drawString(ML, y, "Full Stack Web Development Bootcamp")
    c.setFont("Times-Italic", 9)
    c.setFillColor(MUTED)
    c.drawRightString(PAGE_W - MR, y, "2025")
    y -= 12.5
    c.setFont("Times-Roman", 9.3)
    c.setFillColor(BODY)
    c.drawString(ML, y, "Programming Hero  ·  Certificate of Excellence  ·  MERN stack")
    y -= 15
    c.setFont("Times-Bold", 10)
    c.setFillColor(INK)
    c.drawString(ML, y, "Bachelor of Science, Botany")
    c.setFont("Times-Italic", 9)
    c.setFillColor(MUTED)
    c.drawRightString(PAGE_W - MR, y, "2018 – 2022")
    y -= 12.5
    c.setFont("Times-Roman", 9.3)
    c.setFillColor(BODY)
    c.drawString(ML, y, "University of Dhaka, Bangladesh")
    y -= 16

    y = section_title(c, y, "Languages")
    c.setFont("Times-Roman", 9.4)
    c.setFillColor(BODY)
    c.drawString(ML, y, "English — Intermediate     ·     Bengali — Native")

    c.save()
    print("Wrote", OUT)


if __name__ == "__main__":
    main()
