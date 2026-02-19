'use client';

import { useState, useCallback } from 'react';

const SAMPLE_PROMPT = `You are an advanced AI assistant specialized in software engineering. Your primary responsibility is to help developers write clean, maintainable, and efficient code. When responding to questions about programming, you should provide detailed explanations along with code examples. Always consider best practices, design patterns, and potential edge cases in your responses. If the user asks about a specific programming language or framework, tailor your response to that technology. You should also be aware of common security vulnerabilities and suggest secure coding practices. When debugging, walk through the code step by step and explain your reasoning process. For complex problems, break them down into smaller, manageable pieces and address each one systematically. Remember to consider performance implications and suggest optimizations where appropriate. If you are unsure about something, acknowledge it honestly rather than providing potentially incorrect information.`;

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

  const handleTrySample = () => {
    setInput(SAMPLE_PROMPT);
    setResult(null);
    setError('');
  };

  const wordCount = input.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Input area */}
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
                ? 'This text is too short for compression. Try a longer prompt (50+ words) for meaningful savings.'
                : 'Compression savings are below 20% for this text. The original is more efficient.'}
            </div>
          ) : (
            <>
              {/* Savings banner */}
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-savings animate-pulse-savings">
                  You just saved ${result.stats.dollarsSaved.toFixed(2)}
                </div>
                <div className="text-sm text-text-muted mt-1">
                  {result.stats.tokensSaved.toLocaleString()} tokens &middot; {result.stats.ratio}x compression
                </div>
              </div>

              {/* Split view */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original */}
                <div className="rounded-xl border border-cost/20 bg-bg-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-cost-dim/20">
                    <span className="text-xs font-medium text-cost">Original</span>
                    <span className="text-xs text-cost/70">
                      {result.stats.originalWords.toLocaleString()} words
                    </span>
                  </div>
                  <div className="p-4 max-h-64 overflow-y-auto">
                    <pre className="text-xs text-text-secondary font-mono whitespace-pre-wrap break-words">
                      {input}
                    </pre>
                  </div>
                </div>

                {/* Compressed */}
                <div className="rounded-xl border border-savings/20 bg-bg-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-savings-dim/20">
                    <span className="text-xs font-medium text-savings">Compressed</span>
                    <span className="text-xs text-savings/70">
                      {result.stats.totalCompressedWords.toLocaleString()} words
                    </span>
                  </div>
                  <div className="p-4 max-h-64 overflow-y-auto">
                    <pre className="text-xs text-text-secondary font-mono whitespace-pre-wrap break-words">
                      {result.compressed}
                    </pre>
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
                  { label: 'Rosetta', value: `${result.stats.rosettaWords} words` },
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
