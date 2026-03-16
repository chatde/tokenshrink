'use client';

const PROVIDERS = [
  { name: 'OpenAI', icon: '\u25CE' },
  { name: 'Anthropic', icon: '\u25C6' },
  { name: 'Google AI', icon: '\u25B3' },
  { name: 'Mistral', icon: '\u2726' },
  { name: 'Ollama', icon: '\u2299' },
  { name: 'Any LLM', icon: '\u25A1' },
];

export default function LogoBar() {
  return (
    <section className="px-6 py-14 border-t border-border bg-bg-secondary">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-[11px] tracking-[0.2em] uppercase text-text-muted mb-7">
          Works with every LLM provider
        </p>
        <div className="flex justify-center items-center gap-12 flex-wrap">
          {PROVIDERS.map(({ name, icon }) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 opacity-40 hover:opacity-80 transition-opacity"
            >
              <span className="text-[28px] leading-none text-text">{icon}</span>
              <span className="text-[11px] text-text-muted font-mono">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
