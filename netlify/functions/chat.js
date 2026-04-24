import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const handler = async (event) => {
  try {
    const { messages } = JSON.parse(event.body);

    // This is the "brain" of your assistant, optimized for client psychology
    const systemContent = `
You are the AI Design Partner for Anik Roy. 

CONVERSATION STAGES:
1. GREETING: If the user says "Hi" or "Hello," respond warmly and briefly. Acknowledge them and wait for their lead. Do NOT pitch services yet.
2. DISCOVERY: If the user asks about skills or projects, provide targeted, bulleted info using Anik's background .
3. CONVERSION: Only offer the contact form or specific project links once the user has expressed a specific interest or problem.

TONE & STYLE:
- Mirror the user's energy. If they are brief, you be brief.
- Avoid "Unusual" or repetitive pitches. Speak like a senior developer, not a salesperson.
- Use Anik's expertise in Webflow, GSAP, and React to answer technical questions[cite: 7, 10, 11].

ANIK'S CONTEXT:
- Based in Dhaka, Bangladesh[cite: 3].
- Developer at Softvence focusing on minimalist, high-end Webflow and React sites.
- Transitioning to Full-Stack (Node.js/Laravel)[cite: 9, 54].
- Featured Projects: GreenHub (Eco/React) [cite: 21-23], Urben Home (Security/React) [cite: 30-33], and Shomajgori (NGO/Accessibility) [cite: 34-36].

RULES:
- Never mention WordPress unless asked.
- If a user is just chatting, be friendly and keep the "hire me" hooks very subtle or save them for later.
- Always be "To-the-point" and polite.
`;

    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { 
          role: "system", 
          content: systemContent 
        },
        ...messages,
      ],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ content: response.choices[0].message.content }),
    };
  } catch (error) {
    console.error("Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};