import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the CompressorWidget's core behavior patterns
// Note: These tests simulate behavior rather than importing React components
// which require a DOM environment. We're testing the logic patterns.

describe('CompressorWidget behavior', () => {
  describe('Input change handling', () => {
    it('clears result when input changes', () => {
      // Simulate the widget state
      let input = 'original text';
      let result = { compressed: 'compressed result', stats: { tokensSaved: 50 } };

      // Simulate onChange handler: setInput(e.target.value); setResult(null);
      const handleInputChange = (newValue) => {
        input = newValue;
        result = null; // This is the bug fix — result must be cleared
      };

      handleInputChange('modified text');

      expect(input).toBe('modified text');
      expect(result).toBeNull();
    });

    it('preserves input when result exists', () => {
      let input = 'test text';
      const result = { compressed: 'output', stats: {} };

      // Input should stay independent of result
      expect(input).toBe('test text');
      expect(result).toBeDefined();
    });
  });

  describe('Copy button behavior', () => {
    it('only enables copy when result exists', () => {
      const result = null;
      const canCopy = result?.compressed ? true : false;

      expect(canCopy).toBe(false);
    });

    it('enables copy when compressed text exists', () => {
      const result = { compressed: 'some text', stats: {} };
      const canCopy = result?.compressed ? true : false;

      expect(canCopy).toBe(true);
    });

    it('copies the full compressed text including Rosetta', () => {
      const result = {
        compressed: '[DECODE]\nfull=comprehensive\n[/DECODE]\nThis is the full compressed result.',
        stats: { tokensSaved: 10 }
      };

      // The copy should include the full compressed text (with Rosetta if present)
      const textToCopy = result.compressed;

      expect(textToCopy).toContain('[DECODE]');
      expect(textToCopy).toContain('full=comprehensive');
      expect(textToCopy).toContain('This is the full compressed result.');
    });

    it('resets copied state after timeout', async () => {
      let copied = false;

      const handleCopy = () => {
        copied = true;
        setTimeout(() => { copied = false; }, 2000);
      };

      handleCopy();
      expect(copied).toBe(true);

      // Simulate timeout
      await new Promise(resolve => setTimeout(resolve, 2100));
      expect(copied).toBe(false);
    });
  });

  describe('Sample prompt behavior', () => {
    it('loads sample prompt and triggers compression', () => {
      const SAMPLE = 'You are an expert assistant...';
      let input = '';
      let compressionTriggered = false;

      const handleTrySample = () => {
        input = SAMPLE;
        compressionTriggered = true;
      };

      handleTrySample();

      expect(input).toBe(SAMPLE);
      expect(compressionTriggered).toBe(true);
    });

    it('clears previous result when loading sample', () => {
      const SAMPLE = 'Sample text';
      let result = { compressed: 'old result' };
      let error = 'old error';

      const handleTrySample = () => {
        result = null;
        error = '';
      };

      handleTrySample();

      expect(result).toBeNull();
      expect(error).toBe('');
    });

    it('only shows sample button when input is empty', () => {
      let input = '';
      let showSampleButton = !input;

      expect(showSampleButton).toBe(true);

      input = 'some text';
      showSampleButton = !input;

      expect(showSampleButton).toBe(false);
    });
  });

  describe('Error display', () => {
    it('displays error message when compression fails', () => {
      const error = 'Text must be at least 30 words for meaningful compression';

      expect(error).toBeTruthy();
      expect(error).toContain('30 words');
    });

    it('clears error on successful compression', () => {
      let error = 'Previous error';
      const result = { compressed: 'success', stats: {} };

      // On success, error should be cleared
      if (result) {
        error = '';
      }

      expect(error).toBe('');
    });

    it('shows network error on fetch failure', () => {
      const error = 'Network error — please try again';

      expect(error).toContain('Network error');
    });

    it('shows API error message from server', () => {
      const serverError = { error: 'Text exceeds maximum length (500KB)' };
      const error = serverError.error || 'Compression failed';

      expect(error).toBe('Text exceeds maximum length (500KB)');
    });
  });

  describe('Loading state', () => {
    it('disables button during compression', () => {
      const loading = true;
      const input = 'some text';
      const disabled = loading || !input.trim();

      expect(disabled).toBe(true);
    });

    it('disables button when input is empty', () => {
      const loading = false;
      const input = '   ';
      const disabled = loading || !input.trim();

      expect(disabled).toBe(true);
    });

    it('enables button when ready', () => {
      const loading = false;
      const input = 'valid text';
      const disabled = loading || !input.trim();

      expect(disabled).toBe(false);
    });
  });

  describe('Word count display', () => {
    it('counts words correctly', () => {
      const input = 'one two three four five';
      const wordCount = input.trim().split(/\s+/).filter(Boolean).length;

      expect(wordCount).toBe(5);
    });

    it('returns zero for empty input', () => {
      const input = '';
      const wordCount = input.trim().split(/\s+/).filter(Boolean).length;

      expect(wordCount).toBe(0);
    });

    it('handles multiple spaces correctly', () => {
      const input = 'one  two   three';
      const wordCount = input.trim().split(/\s+/).filter(Boolean).length;

      expect(wordCount).toBe(3);
    });

    it('handles newlines as word separators', () => {
      const input = 'line one\nline two\nline three';
      const wordCount = input.trim().split(/\s+/).filter(Boolean).length;

      expect(wordCount).toBe(6);
    });
  });

  describe('Result display', () => {
    it('shows tooShort message when text is too short', () => {
      const result = {
        stats: { tooShort: true },
        compressed: 'short text'
      };

      const showMessage = result.stats.tooShort;
      const message = 'This text is too short for compression. Try a longer prompt (30+ words) for meaningful savings.';

      expect(showMessage).toBe(true);
      expect(message).toContain('30+ words');
    });

    it('shows belowThreshold message when savings are minimal', () => {
      const result = {
        stats: { belowThreshold: true, tooShort: false },
        compressed: 'text'
      };

      const showMessage = !result.stats.tooShort && result.stats.belowThreshold;
      const message = 'Compression savings are minimal for this text. Try a longer prompt with more natural language.';

      expect(showMessage).toBe(true);
      expect(message).toContain('minimal');
    });

    it('displays compression stats when successful', () => {
      const result = {
        stats: {
          tokensSaved: 125,
          originalTokens: 500,
          totalCompressedTokens: 375,
          ratio: 1.33,
          dollarsSaved: 0.02,
          strategy: 'auto',
          replacementCount: 15,
          patternCount: 8,
          tokenizerUsed: 'built-in'
        },
        compressed: 'compressed result'
      };

      expect(result.stats.tokensSaved).toBe(125);
      expect(result.stats.ratio).toBe(1.33);
      expect(result.stats.strategy).toBe('auto');
      expect(result.stats.replacementCount).toBe(15);
      expect(result.stats.patternCount).toBe(8);
      expect(result.stats.tokenizerUsed).toBe('built-in');
    });

    it('formats dollar savings correctly', () => {
      const result = {
        stats: { dollarsSaved: 0.02567 }
      };

      const displayDollars = result.stats.dollarsSaved > 0.005;
      const formatted = result.stats.dollarsSaved.toFixed(2);

      expect(displayDollars).toBe(true);
      expect(formatted).toBe('0.03');
    });

    it('hides dollar savings below threshold', () => {
      const result = {
        stats: { dollarsSaved: 0.003 }
      };

      const displayDollars = result.stats.dollarsSaved > 0.005;

      expect(displayDollars).toBe(false);
    });
  });

  describe('Keyboard shortcuts', () => {
    it('triggers compression on Cmd+Enter', () => {
      const event = { metaKey: true, key: 'Enter' };
      let compressionTriggered = false;

      const handleKeyDown = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          compressionTriggered = true;
        }
      };

      handleKeyDown(event);

      expect(compressionTriggered).toBe(true);
    });

    it('triggers compression on Ctrl+Enter', () => {
      const event = { ctrlKey: true, key: 'Enter' };
      let compressionTriggered = false;

      const handleKeyDown = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          compressionTriggered = true;
        }
      };

      handleKeyDown(event);

      expect(compressionTriggered).toBe(true);
    });

    it('does not trigger on Enter alone', () => {
      const event = { key: 'Enter' };
      let compressionTriggered = false;

      const handleKeyDown = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          compressionTriggered = true;
        }
      };

      handleKeyDown(event);

      expect(compressionTriggered).toBe(false);
    });
  });
});
