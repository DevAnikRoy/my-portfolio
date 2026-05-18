# 🤖 Anik's Creative Portfolio v2.0
> **Next-Gen Web Architecture & AI Command Center**

---

## 🧠 The AI Core: Llama 3.3 70B

The centerpiece of this portfolio is a custom-integrated Personal AI Agent powered by the **Llama 3.3 70B Versatile** model via Groq’s ultra-low latency inference engine.

* **Model:** Llama 3.3 70-Billion Parameter (Meta)
* **Inference:** Groq LPUs (Liquid Processing Units) for near-instant responses.
* **Role:** Acts as Anik’s digital twin, capable of explaining technical architectural choices, discussing project history, and converting visitors into leads.
* **Security:** Handled via Serverless Node.js functions to ensure API keys never touch the client-side.

---

## 🎙️ Neural Voice Control

I’ve implemented a Neural Command Layer that allows users to interact with the site entirely hands-free.

* **Voice-to-Action:** High-accuracy speech recognition that maps natural language to frontend routes.
* **Interactive Navigation:** Say *"Take me to the projects"* or *"I want to hire you"* to trigger GSAP-driven smooth-scroll animations to specific viewports.
* **Feedback Loop:** A custom 0.5ms delayed popup response system ensures the user knows exactly when the AI has executed their command.

---

## 🛠️ The "Creative Dev" Tech Stack

### Frontend & 3D Immersion
* **React 18:** The foundation for building scalable, high-performance UI components.
* **GSAP (GreenSock):** The engine behind the "Butter-Smooth" transitions and complex timeline sequences.
* **Three.js / React Three Fiber:** Powering the immersive 3D shapes and interactive web environments.
* **Tailwind CSS:** Used for a minimalist, bold, and fully responsive fluid design system.

### Backend & DevOps
* **Netlify Functions:** Serverless architecture for secure AI handshakes and form processing.
* **Groq API SDK:** Advanced production integration for high-speed LLM completion streams.
* **Git Secret Management:** Enterprise-grade environment variable handling to prevent credential leaks.

---

## 🚀 Interactive Components

### The Magnetic Chatbot
A custom-built floating interface that tracks the user’s journey. It is designed with a "Listen-First" UX strategy:
* **Passive Mode:** Stays subtle and non-intrusive while the user explores.
* **Consultative Mode:** Offers logic-based platform suggestions (e.g., comparing Webflow vs. Custom React builds).
* **Lead Gen:** Provides direct conversational handoffs to WhatsApp, LinkedIn, and GitHub upon request.

### Liquid Cursor Architecture
A custom Magnetic Cursor built with GSAP that dynamically morphs its shape and color scale based on proximity to interactive elements, enhancing the "Immersive Architect" feel of the interface.

---

## 📦 Local Development Guide

### 1. Clone & Install
```bash
git clone [https://github.com/DevAnikRoy/my-portfolio.git](https://github.com/DevAnikRoy/my-portfolio.git)
cd my-portfolio
npm install --legacy-peer-deps

2. Environment Sync
Create a .env file in the root directory and append your secure key:

Plaintext
GROQ_API_KEY=your_actual_groq_key_here
3. Execute via Netlify CLI
Run the local serverless development environment:

Bash
netlify dev
⚠️ Note: Running the project via netlify dev is mandatory to boot up and proxy the serverless Llama 3.3 backend locally.

🤝 Contact & Community
LinkedIn: Anik Roy

GitHub: @DevAnikRoy

Email: anikroy302@gmail.com

"Design is not just what it looks like; design is how it works."
— Built with passion by Anik.