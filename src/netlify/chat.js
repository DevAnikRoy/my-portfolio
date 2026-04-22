// netlify/functions/chat.js
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event) => {
  const { messages } = JSON.parse(event.body);

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // or "gpt-4o"
    messages: [
      { role: "system", content: "You are Anik's AI Assistant. Anik is a Webflow & React developer at Softvence. He loves GSAP and minimalist design. Keep answers short and professional." },
      ...messages,
    ],
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ content: response.choices[0].message.content }),
  };
};