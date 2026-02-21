// Batch compress multiple prompts
// Run: node examples/batch-compress.mjs

const prompts = [
  'You are a helpful assistant. Please make sure to provide accurate information. If you are unsure about something, acknowledge it honestly rather than providing incorrect information.',
  'Write a function that validates user input. It is important to consider edge cases and handle errors properly. Make sure to sanitize the data before processing.',
  'Explain the difference between SQL and NoSQL databases. Provide examples of when to use each one. Include considerations for scalability, performance, and data modeling.',
];

console.log('Batch compression results:\n');

for (const [i, prompt] of prompts.entries()) {
  const res = await fetch('https://tokenshrink.com/api/compress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: prompt }),
  });

  const data = await res.json();

  if (data.stats?.tooShort || data.stats?.belowThreshold) {
    console.log(`Prompt ${i + 1}: Too short for meaningful compression`);
  } else {
    console.log(`Prompt ${i + 1}: ${data.stats.originalWords} → ${data.stats.totalCompressedWords} words (${data.stats.tokensSaved} tokens saved)`);
  }
}
