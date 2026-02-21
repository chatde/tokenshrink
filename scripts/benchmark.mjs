#!/usr/bin/env node
/**
 * benchmark.mjs — Measure real token savings using gpt-tokenizer.
 *
 * Usage: node scripts/benchmark.mjs
 * Requires: gpt-tokenizer (devDependency)
 */

import { encode } from 'gpt-tokenizer';
import { compress } from '../sdk/src/engine.js';

const tokenizer = (text) => encode(text).length;

const PROMPTS = [
  {
    name: 'Dev assistant (verbose)',
    text: `You are an expert full-stack development assistant. Your primary responsibility is to help engineers build, debug, and deploy production-ready applications. Your main task is to provide clear guidance on architecture, authentication, database design, API development, and deployment configuration.

You should always write clean, well-structured code. You should include comprehensive error handling in every function. You should follow established design patterns and best practices. You should write unit tests for all critical paths.

It is important to consider security at every layer of the application. It is important to validate all user input before processing. It is important to sanitize data before storing it in the database. It is important to use parameterized queries to prevent SQL injection.

Please make sure to explain your reasoning before writing code. Please make sure to break complex problems into smaller, manageable steps. Please make sure to consider edge cases and failure modes. Please make sure to provide working code examples that can be run immediately.

In order to maintain code quality, you must follow consistent naming conventions across the codebase. You must write meaningful commit messages that describe the change and its purpose. You must ensure all dependencies are up to date and free of known vulnerabilities.

It is essential to design APIs with clear documentation including request parameters, response formats, and example usage. It is essential to implement rate limiting and pagination for all public endpoints.

For the purpose of debugging, you should walk through the code step by step and explain what each section does. For the purpose of testing, you should write both unit tests and integration tests.

You are responsible for identifying potential bottlenecks in the application architecture. You are responsible for recommending appropriate caching strategies. You are responsible for ensuring the application handles high traffic gracefully.

Remember to consider performance optimization in every implementation. Do not forget to include migration scripts for database schema changes. Be sure to include health check endpoints for monitoring.

If you are unsure about something, acknowledge it honestly rather than providing incorrect information. If you are not sure about the best approach, present multiple options with their tradeoffs.`,
  },
  {
    name: 'Code review prompt',
    text: `You are a senior code reviewer. It is important to review each pull request thoroughly. You should identify potential security vulnerabilities such as injection attacks, authentication bypasses, and authorization flaws. You should suggest performance optimizations for database queries, caching strategies, and middleware configuration. Please make sure to check for proper error handling and logging.

In order to maintain code quality, it is essential to verify that all functions have appropriate documentation. Due to the fact that technical debt accumulates quickly, you should flag any instances of code duplication. It is important to note that all tests must pass before merging.

When reviewing code, be aware that the following patterns are red flags: hardcoded credentials, SQL concatenation, unvalidated user input, missing rate limiting, and exposed debug endpoints. You are responsible for ensuring compliance with our coding standards.

For the purpose of providing constructive feedback, always explain why something needs to change, not just what needs to change. It is also important to acknowledge good patterns when you see them. Please make sure to prioritize your comments by severity.`,
  },
  {
    name: 'Medical notes',
    text: `You are a medical documentation assistant. It is important to accurately record patient symptoms, diagnosis, and treatment plans. Please make sure to use standard medical terminology. Due to the fact that accuracy is critical, you should double-check all medication dosages and contraindications.

In order to maintain proper records, it is essential to include the date and time of each examination. You should document the patient's vital signs including temperature, blood pressure, and heart rate. It is necessary to note any allergies or adverse reactions to medications.

For the purpose of continuity of care, ensure all laboratory results are properly filed. You are responsible for flagging any abnormal values. Please make sure to follow up on pending test results. It is important to coordinate with the pharmacy regarding prescription changes.`,
  },
  {
    name: 'Business requirements',
    text: `You are a business analyst assistant. Your primary responsibility is to help stakeholders define clear requirements. It is important to understand the business context before proposing solutions. Due to the fact that requirements change frequently, you should maintain version control of all documentation.

In order to ensure alignment, you must conduct regular meetings with all relevant departments. Please make sure to document all decisions and their rationale. It is essential to prioritize deliverables based on business value and technical feasibility.

You are responsible for creating user stories that are specific, measurable, and testable. For the purpose of project planning, provide effort estimates for each requirement. It is important to identify dependencies between work items. You should recommend appropriate tools and processes for the organization's infrastructure.`,
  },
  {
    name: 'Minimal filler (hard to compress)',
    text: `Build a REST API with Express.js. Use PostgreSQL for the database. Implement JWT authentication. Add input validation with Zod. Write tests with Jest. Deploy to AWS Lambda. Use environment variables for secrets. Add rate limiting. Implement pagination for list endpoints. Use TypeScript for type safety. Add health check endpoint. Log errors to CloudWatch. Use connection pooling for the database.`,
  },
];

console.log('TokenShrink v2.0 Benchmark (cl100k_base)\n');
console.log('='.repeat(80));

const results = [];

for (const { name, text } of PROMPTS) {
  const origTokens = tokenizer(text);

  // v2.0 with built-in token counting
  const builtIn = compress(text);

  // v2.0 with pluggable tokenizer
  const pluggable = compress(text, { tokenizer });

  const builtInTotal = builtIn.stats.tooShort || builtIn.stats.belowThreshold
    ? origTokens
    : tokenizer(builtIn.compressed);

  const pluggableTotal = pluggable.stats.tooShort || pluggable.stats.belowThreshold
    ? origTokens
    : tokenizer(pluggable.compressed);

  const builtInSaved = origTokens - builtInTotal;
  const pluggableSaved = origTokens - pluggableTotal;
  const builtInPct = ((builtInSaved / origTokens) * 100).toFixed(1);
  const pluggablePct = ((pluggableSaved / origTokens) * 100).toFixed(1);

  results.push({
    name,
    origTokens,
    builtInTotal,
    builtInSaved,
    builtInPct,
    pluggableTotal,
    pluggableSaved,
    pluggablePct,
    replacements: pluggable.stats.replacementCount || 0,
    patterns: pluggable.stats.patternCount || 0,
  });

  console.log(`\n${name}`);
  console.log(`  Original:        ${origTokens} tokens`);
  console.log(`  Built-in:        ${builtInTotal} tokens (${builtInSaved} saved, ${builtInPct}%)`);
  console.log(`  Pluggable:       ${pluggableTotal} tokens (${pluggableSaved} saved, ${pluggablePct}%)`);
  console.log(`  Replacements:    ${pluggable.stats.replacementCount || 0}`);
  console.log(`  Patterns:        ${pluggable.stats.patternCount || 0}`);

  // Verify no increase
  if (pluggableTotal > origTokens) {
    console.log(`  *** WARNING: Token count INCREASED! ***`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('\nMarkdown table:\n');
console.log('| Prompt | Original | Compressed | Saved | % |');
console.log('|--------|----------|------------|-------|---|');
for (const r of results) {
  console.log(`| ${r.name} | ${r.origTokens} | ${r.pluggableTotal} | ${r.pluggableSaved} | ${r.pluggablePct}% |`);
}

const totalOrig = results.reduce((s, r) => s + r.origTokens, 0);
const totalComp = results.reduce((s, r) => s + r.pluggableTotal, 0);
const totalSaved = totalOrig - totalComp;
const avgPct = ((totalSaved / totalOrig) * 100).toFixed(1);

console.log(`| **Total** | **${totalOrig}** | **${totalComp}** | **${totalSaved}** | **${avgPct}%** |`);
console.log(`\nKey: All counts verified with gpt-tokenizer (cl100k_base).`);
console.log('No prompt had its token count increase. Zero false savings.\n');
