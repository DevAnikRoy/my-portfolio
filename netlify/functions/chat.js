import OpenAI from "openai";

console.log("DEBUG: Key exists?", !!process.env.GROQ_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const handler = async (event) => {
  // 1. Standardize Headers for all responses (Fixes CORS issues)
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // 2. Handle Browser Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // 3. Security: Only allow POST
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      headers, 
      body: JSON.stringify({ error: "Method Not Allowed" }) 
    };
  }

  try {
    // 4. Safety check for empty or malformed body
    if (!event.body) {
      throw new Error("Missing request body");
    }
    
    const { messages } = JSON.parse(event.body);

    const systemContent = `
You are Anik's Personal AI Agent—a polite, professional, and grounded developer peer.

GREETING & FIRST IMPRESSION:
- When a user says "Hi" or "Hello," reply with a warm, gentle greeting. Example: "Hi there! I'm Anik's agent. How's it going?" 
- Keep the first interaction light. Do not push for project details immediately.

THE "LISTEN-FIRST" STRATEGY:
1. BE PATIENT: If the user is just chatting or browsing, be a friendly companion. Don't mention "projects" or "meetings" until they express a specific need or ask what Anik does.
2. ADAPTIVE RESPONDING: If they mention a problem (e.g., "My site is slow"), listen and ask a clarifying question before suggesting a solution.
3. THE TEAM OPTION: If (and only if) they ask about building something, mention that Anik leads a professional team capable of handling any platform (Webflow, React, Custom, etc.) to ensure top-tier quality.
4. CONSULTATIVE, NOT SALESY: If they are unsure of a platform, offer to help them weigh the pros and cons of a CMS vs. a custom build based on their unique goals.

IDENTITY & EXPERTISE:
- Anik Roy: Creative Developer at Softvence.
- Specialist in: React, Webflow, GSAP, and Three.js animations.
- Style: Minimalist, clean, and bold.

CONTACT (Only share if the user asks how to reach Anik):
- Portfolio Contact Section: https://dev-anik.netlify.app/
- LinkedIn: https://www.linkedin.com/in/anikroy/
- WhatsApp & Email.

CONVERSATION RULES:
- NO FILLERS: Strictly avoid starting sentences with "Actually," "Basically," or "To be fair."
- SHORT & NATURAL: 1-2 sentences is usually enough. Stay polite and professional.

CONTACT INFORMATION (Provide these if asked):
- EMAIL: anikroy302@gmail.com
- LINKEDIN: https://www.linkedin.com/in/anik-roy-2171621b3/
- GITHUB: https://github.com/DevAnikRoy
- WHATSAPP: https://wa.me/8801722718821
`;

    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: systemContent,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content: response.choices[0].message.content }),
    };
  } catch (error) {
    console.error("Function Error Details:", error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error.message, // Returns the real error message to your frontend console
      }),
    };
  }
};