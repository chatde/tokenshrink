// Basic TokenShrink API usage
// Run: node examples/basic-usage.mjs

const prompt = `You are an expert software engineer. Your primary responsibility is to help developers write clean, maintainable, and efficient code. When responding to questions about programming, you should provide detailed explanations along with code examples. Always consider best practices, design patterns, and potential edge cases in your responses. If the user asks about a specific programming language or framework, tailor your response to that technology. Please make sure to explain your reasoning before writing code.`;

console.log('Original prompt:');
console.log(prompt);
console.log(`\nWords: ${prompt.split(/\s+/).length}`);

const res = await fetch('https://tokenshrink.com/api/compress', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: prompt }),
});

const data = await res.json();

console.log('\n--- Compressed ---');
console.log(data.compressed);
console.log(`\nOriginal: ${data.stats.originalWords} words`);
console.log(`Compressed: ${data.stats.totalCompressedWords} words`);
console.log(`Tokens saved: ${data.stats.tokensSaved}`);
console.log(`Strategy: ${data.stats.strategy}`);
