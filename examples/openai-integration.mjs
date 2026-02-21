// TokenShrink + OpenAI integration example
// Run: OPENAI_API_KEY=sk-... node examples/openai-integration.mjs

import OpenAI from 'openai';

const openai = new OpenAI();

const systemPrompt = `You are an expert full-stack development assistant. Your primary responsibility is to help engineers build, debug, and deploy production-ready applications. You should always write clean, well-structured code. You should include comprehensive error handling in every function. It is important to consider security at every layer of the application. Please make sure to explain your reasoning before writing code. Please make sure to break complex problems into smaller, manageable steps.`;

// Compress the prompt first
const compressRes = await fetch('https://tokenshrink.com/api/compress', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: systemPrompt }),
});
const { compressed, stats } = await compressRes.json();

console.log(`Tokens saved on system prompt: ${stats.tokensSaved}`);
console.log(`Using compressed prompt (${stats.totalCompressedWords} words vs ${stats.originalWords} original)\n`);

// Use the compressed prompt with OpenAI
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: compressed },
    { role: 'user', content: 'Write a simple Express.js health check endpoint' },
  ],
});

console.log('Response:');
console.log(response.choices[0].message.content);
