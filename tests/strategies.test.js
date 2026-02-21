import { describe, it, expect } from 'vitest';
import { detectStrategy } from '../app/lib/compression/strategies.js';

describe('detectStrategy()', () => {
  it('detects code domain', () => {
    const result = detectStrategy(
      'Write a function that handles API endpoints with middleware. Debug the controller and fix the repository pattern implementation. Use async await for database queries.'
    );
    expect(result.domain).toBe('code');
  });

  it('detects medical domain', () => {
    const result = detectStrategy(
      'The patient presents with symptoms including elevated temperature. The diagnosis indicates the need for prescription medication. Schedule a laboratory examination and review the treatment plan.'
    );
    expect(result.domain).toBe('medical');
  });

  it('detects legal domain', () => {
    const result = detectStrategy(
      'The plaintiff filed a complaint in the jurisdiction of the court. The defendant contests the agreement pursuant to the subsection noted hereinafter. Notwithstanding the aforementioned terms, the contract is void.'
    );
    expect(result.domain).toBe('legal');
  });

  it('detects business domain', () => {
    const result = detectStrategy(
      'The stakeholder meeting reviewed the quarterly deliverables. The organization management department approved the infrastructure requirements. The implementation timeline was approximately three months.'
    );
    expect(result.domain).toBe('business');
  });

  it('falls back to auto for generic text', () => {
    const result = detectStrategy(
      'The weather today is sunny and warm. I went for a walk in the park and saw some birds. The flowers are blooming nicely this time of year.'
    );
    expect(['auto', 'common']).toContain(result.domain);
  });

  it('returns a confidence value', () => {
    const result = detectStrategy(
      'Write a function that returns a boolean value from the database query.'
    );
    expect(typeof result.confidence).toBe('number');
  });
});
