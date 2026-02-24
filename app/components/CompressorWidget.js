'use client';

import { useState, useCallback } from 'react';

const SAMPLE_PROMPT = `You are an expert full-stack development assistant. Your primary responsibility is to help engineers build, debug, and deploy production-ready applications. Your main task is to provide clear guidance on architecture, authentication, database design, API development, and deployment configuration.

You should always write clean, well-structured code. You should include comprehensive error handling in every function. You should follow established design patterns and best practices. You should write unit tests for all critical paths. You should document all public interfaces with clear descriptions of parameters and return values.

It is important to consider security at every layer of the application. It is important to validate all user input before processing. It is important to sanitize data before storing it in the database. It is important to use parameterized queries to prevent SQL injection. It is important to implement proper authentication and authorization checks on every endpoint.

Please make sure to explain your reasoning before writing code. Please make sure to break complex problems into smaller, manageable steps. Please make sure to consider edge cases and failure modes. Please make sure to provide working code examples that can be run immediately.

When reviewing code, you should identify potential security vulnerabilities such as injection attacks, authentication bypasses, and authorization flaws. You should suggest performance optimizations for database queries, caching strategies, and middleware configuration. You should recommend improvements to error handling, logging, and monitoring.

In order to maintain code quality, you must follow consistent naming conventions across the codebase. You must write meaningful commit messages that describe the change and its purpose. You must ensure all dependencies are up to date and free of known vulnerabilities. You must implement proper logging for debugging and audit purposes.

It is essential to design APIs with clear documentation including request parameters, response formats, and example usage. It is essential to implement rate limiting and pagination for all public endpoints. It is essential to use environment variables for all configuration values rather than hardcoding them. It is essential to set up proper error monitoring and alerting for production systems.

For the purpose of debugging, you should walk through the code step by step and explain what each section does. For the purpose of testing, you should write both unit tests and integration tests. For the purpose of deployment, you should provide clear instructions for development and production environments.

You are responsible for identifying potential bottlenecks in the application architecture. You are responsible for recommending appropriate caching strategies. You are responsible for ensuring the application handles high traffic gracefully. You are responsible for documenting the infrastructure and deployment procedures.

Remember to consider performance optimization in every implementation. Do not forget to include migration scripts for database schema changes. Do not forget to document all environment variables and their expected values. Be sure to include health check endpoints for monitoring.

If you are unsure about something, acknowledge it honestly rather than providing incorrect information. If you are not sure about the best approach, present multiple options with their tradeoffs.`;

export default function CompressorWidget() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const handleShrink = useCallback(async () => {
    const text = input.trim();
    if (!text) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/compress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Compression failed');
        return;
      }

      setResult(data);
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleShrink();
    }
  };

  const handleCopy = async () => {
    if (!result?.compressed) return;
    await navigator.clipboard.writeText(result.compressed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTrySample = async () => {
    setInput(SAMPLE_PROMPT);
    setResult(null);
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/compress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: SAMPLE_PROMPT }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Compression failed');
        return;
      }

      setResult(data);
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  const wordCount = input.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Input area */}
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setResult(null); }}
          onKeyDown={handleKeyDown}
          placeholder="Paste your prompt, system message, or any text..."
          className="w-full h-48 p-5 bg-bg-card border border-border rounded-xl text-text font-mono text-sm resize-none focus:outline-none focus:border-savings/50 focus:ring-1 focus:ring-savings/20 transition-all placeholder:text-text-muted"
        />
        <div className="absolute bottom-3 left-5 text-xs text-text-muted">
          {wordCount > 0 ? `${wordCount} words` : ''}
        </div>
        <div className="absolute bottom-3 right-5 text-xs text-text-muted">
          {'\u2318'}+Enter to shrink
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={handleShrink}
          disabled={loading || !input.trim()}
          className="px-8 py-3 bg-savings text-bg font-semibold rounded-lg hover:bg-savings/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Shrinking...
            </span>
          ) : (
            'Shrink'
          )}
        </button>

        {!input && (
          <button
            onClick={handleTrySample}
            className="px-4 py-3 text-sm text-text-secondary border border-border rounded-lg hover:border-border-hover hover:text-text transition-all"
          >
            Try a sample prompt
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-cost-dim/30 border border-cost/20 rounded-lg text-cost text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-8 animate-slide-up">
          {result.stats.tooShort || result.stats.belowThreshold ? (
            <div className="p-4 bg-bg-card border border-border rounded-lg text-text-secondary text-sm">
              {result.stats.tooShort
                ? 'This text is too short for compression. Try a longer prompt (30+ words) for meaningful savings.'
                : 'Compression savings are minimal for this text. Try a longer prompt with more natural language.'}
            </div>
          ) : (
            <>
              {/* Savings banner */}
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-savings animate-pulse-savings">
                  {result.stats.tokensSaved.toLocaleString()} tokens saved
                </div>
                <div className="text-sm text-text-muted mt-1">
                  {result.stats.ratio}x compression &middot; {result.stats.originalTokens.toLocaleString()} &rarr; {result.stats.totalCompressedTokens.toLocaleString()} tokens
                  {result.stats.dollarsSaved > 0.005 && ` · $${result.stats.dollarsSaved.toFixed(2)} saved`}
                </div>
              </div>

              {/* Split view */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original */}
                <div className="rounded-xl border border-cost/20 bg-bg-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-cost-dim/20">
                    <span className="text-xs font-medium text-cost">Original</span>
                    <span className="text-xs text-cost/70">
                      {result.stats.originalTokens.toLocaleString()} tokens
                    </span>
                  </div>
                  <div className="p-4 max-h-64 overflow-y-auto">
                    <pre className="text-xs text-text-secondary font-mono whitespace-pre-wrap break-words">{input}</pre>
                  </div>
                </div>

                {/* Compressed */}
                <div className="rounded-xl border border-savings/20 bg-bg-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-savings-dim/20">
                    <span className="text-xs font-medium text-savings">Compressed</span>
                    <span className="text-xs text-savings/70">
                      {result.stats.totalCompressedTokens.toLocaleString()} tokens
                    </span>
                  </div>
                  <div className="p-4 max-h-64 overflow-y-auto">
                    <pre className="text-xs text-text-secondary font-mono whitespace-pre-wrap break-words">{result.compressed}</pre>
                  </div>
                </div>
              </div>

              {/* Copy button */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleCopy}
                  className="px-6 py-2.5 text-sm font-medium rounded-lg border border-savings/30 text-savings hover:bg-savings/10 transition-all"
                >
                  {copied ? 'Copied!' : 'Copy compressed text'}
                </button>
              </div>

              {/* Stats detail */}
              <div className="grid grid-cols-4 gap-3 mt-6">
                {[
                  { label: 'Strategy', value: result.stats.strategy },
                  { label: 'Replacements', value: result.stats.replacementCount },
                  { label: 'Patterns', value: result.stats.patternCount },
                  { label: 'Tokenizer', value: result.stats.tokenizerUsed },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-3 bg-bg-card rounded-lg border border-border">
                    <div className="text-xs text-text-muted mb-1">{label}</div>
                    <div className="text-sm font-medium text-text">{value}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
