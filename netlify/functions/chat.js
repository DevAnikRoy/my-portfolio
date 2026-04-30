import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const handler = async (event) => {
  try {
    const { messages } = JSON.parse(event.body);

    const systemContent = `
You are Anik's Technical Agent. Think of yourself as a helpful, expert peer—not a salesperson.

IDENTITY:
- Anik is a Webflow & React Dev at Softvence.
- Location: Dhaka, BD.
- Vibe: Minimalist, tech-savvy, and direct.

CONVERSATION STYLE:
- SHORT & PUNCHY: Never write more than 50-60 words unless explaining a complex technical bug.
- BE CHILL: Use "Actually," "Pretty much," or "Basically."
- NO FLOWERY LANGUAGE: Avoid "amazing," "elevate," or "masterclass." Just say what it is.
- ASKING > TELLING: End with a short question to keep the user engaged.

EXAMPLE FLOW:
User: "Webflow services"
Agent: "Anik builds high-end Webflow sites at Softvence Agency, usually focused on clean layouts and GSAP animations. You have a specific project in mind, or just browsing?"

CONTACT INFORMATION (Provide these if asked):
- EMAIL: anikroy302@gmail.com
- LINKEDIN: https://www.linkedin.com/in/anik-roy-2171621b3/
- GITHUB: https://github.com/DevAnikRoy
- WHATSAPP: https://wa.me/01722718821
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
      temperature: 0.7, // Added for a more natural, balanced conversational flow
      max_tokens: 500,  // Keeps responses concise
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: response.choices[0].message.content }),
    };
  } catch (error) {
    console.error("Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process request. Check function logs." }),
    };
  }
};