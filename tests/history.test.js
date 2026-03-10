import { describe, it, expect } from 'vitest';
import { compressHistory } from '../sdk/src/history.js';

// Verbose enough to cross the 30-word MIN_WORDS_FOR_COMPRESSION threshold
// and contains known compressible phrases for reliable stats.
const COMPRESSIBLE =
  'It is important to validate all user input carefully. Please make sure to handle errors properly. ' +
  'In order to build robust applications, you must follow best practices. For the purpose of testing, ' +
  'write comprehensive test cases. Remember to document everything thoroughly. Do not forget to monitor performance metrics.';

describe('compressHistory()', () => {
  describe('basic compression of user and assistant messages', () => {
    it('returns a messages array of the same length', () => {
      const messages = [
        { role: 'user', content: COMPRESSIBLE },
        { role: 'assistant', content: COMPRESSIBLE },
      ];
      const { messages: out } = compressHistory(messages);
      expect(out).toHaveLength(2);
    });

    it('compresses eligible string-content messages', () => {
      const messages = [{ role: 'user', content: COMPRESSIBLE }];
      const { messages: out, stats } = compressHistory(messages);
      expect(typeof out[0].content).toBe('string');
      expect(stats.messagesCompressed).toBe(1);
      expect(stats.totalTokensBefore).toBeGreaterThan(0);
    });

    it('content is a non-empty string on the returned message', () => {
      const messages = [{ role: 'user', content: COMPRESSIBLE }];
      const { messages: out } = compressHistory(messages);
      expect(typeof out[0].content).toBe('string');
      expect(out[0].content.length).toBeGreaterThan(0);
    });
  });

  describe('system messages are skipped by default', () => {
    it('does not compress system-role messages', () => {
      const systemContent = COMPRESSIBLE;
      const messages = [
        { role: 'system', content: systemContent },
        { role: 'user', content: COMPRESSIBLE },
      ];
      const { messages: out, stats } = compressHistory(messages);
      expect(out[0].content).toBe(systemContent);
      expect(stats.messagesCompressed).toBe(1);
    });

    it('system message tokens are not counted in stats', () => {
      const messages = [{ role: 'system', content: COMPRESSIBLE }];
      const { stats } = compressHistory(messages);
      expect(stats.messagesCompressed).toBe(0);
      expect(stats.totalTokensBefore).toBe(0);
      expect(stats.totalTokensAfter).toBe(0);
    });

    it('respects empty skipRoles — system message becomes eligible', () => {
      const messages = [
        { role: 'system', content: COMPRESSIBLE },
        { role: 'user', content: COMPRESSIBLE },
      ];
      const { stats } = compressHistory(messages, { skipRoles: [] });
      expect(stats.messagesCompressed).toBe(2);
    });

    it('skips multiple roles listed in skipRoles', () => {
      const messages = [
        { role: 'system', content: COMPRESSIBLE },
        { role: 'user', content: COMPRESSIBLE },
        { role: 'assistant', content: COMPRESSIBLE },
      ];
      const { stats } = compressHistory(messages, { skipRoles: ['system', 'assistant'] });
      expect(stats.messagesCompressed).toBe(1);
    });
  });

  describe('tool call messages (array content) are skipped', () => {
    it('does not attempt to compress array-content messages', () => {
      const toolMessage = {
        role: 'user',
        content: [{ type: 'tool_result', tool_use_id: 'abc', content: 'result text' }],
      };
      const { messages: out, stats } = compressHistory([toolMessage]);
      expect(Array.isArray(out[0].content)).toBe(true);
      expect(stats.messagesCompressed).toBe(0);
    });

    it('tool call message tokens are not counted in stats', () => {
      const messages = [
        { role: 'assistant', content: [{ type: 'tool_use', id: 'abc', name: 'search', input: {} }] },
      ];
      const { stats } = compressHistory(messages);
      expect(stats.totalTokensBefore).toBe(0);
      expect(stats.totalTokensAfter).toBe(0);
    });

    it('compresses string messages alongside tool-call messages', () => {
      const messages = [
        { role: 'user', content: COMPRESSIBLE },
        { role: 'assistant', content: [{ type: 'tool_use', id: 'xyz', name: 'lookup', input: {} }] },
      ];
      const { stats } = compressHistory(messages);
      expect(stats.messagesCompressed).toBe(1);
    });
  });

  describe('stats are correctly aggregated', () => {
    it('returns all four required stats fields', () => {
      const messages = [{ role: 'user', content: COMPRESSIBLE }];
      const { stats } = compressHistory(messages);
      expect(stats).toHaveProperty('totalTokensSaved');
      expect(stats).toHaveProperty('totalTokensBefore');
      expect(stats).toHaveProperty('totalTokensAfter');
      expect(stats).toHaveProperty('messagesCompressed');
    });

    it('totalTokensSaved equals totalTokensBefore minus totalTokensAfter', () => {
      const messages = [
        { role: 'user', content: COMPRESSIBLE },
        { role: 'assistant', content: COMPRESSIBLE },
      ];
      const { stats } = compressHistory(messages);
      expect(stats.totalTokensSaved).toBe(stats.totalTokensBefore - stats.totalTokensAfter);
    });

    it('totalTokensSaved is >= 0', () => {
      const messages = [{ role: 'user', content: COMPRESSIBLE }];
      const { stats } = compressHistory(messages);
      expect(stats.totalTokensSaved).toBeGreaterThanOrEqual(0);
    });

    it('messagesCompressed counts only non-skipped string-content messages', () => {
      const messages = [
        { role: 'system', content: COMPRESSIBLE },
        { role: 'user', content: COMPRESSIBLE },
        { role: 'assistant', content: [{ type: 'tool_use', id: '1', name: 'x', input: {} }] },
        { role: 'assistant', content: COMPRESSIBLE },
      ];
      const { stats } = compressHistory(messages);
      expect(stats.messagesCompressed).toBe(2);
    });

    it('all stats are zero when every message is skipped', () => {
      const messages = [
        { role: 'system', content: COMPRESSIBLE },
        { role: 'user', content: [{ type: 'tool_result', tool_use_id: 'a', content: 'x' }] },
      ];
      const { stats } = compressHistory(messages);
      expect(stats.messagesCompressed).toBe(0);
      expect(stats.totalTokensBefore).toBe(0);
      expect(stats.totalTokensAfter).toBe(0);
      expect(stats.totalTokensSaved).toBe(0);
    });
  });

  describe('return value preserves original message shape', () => {
    it('preserves role on each returned message', () => {
      const messages = [
        { role: 'user', content: COMPRESSIBLE },
        { role: 'assistant', content: COMPRESSIBLE },
      ];
      const { messages: out } = compressHistory(messages);
      expect(out[0].role).toBe('user');
      expect(out[1].role).toBe('assistant');
    });

    it('preserves extra fields on message objects', () => {
      const messages = [{ role: 'user', content: COMPRESSIBLE, name: 'alice', id: 'msg_001' }];
      const { messages: out } = compressHistory(messages);
      expect(out[0].name).toBe('alice');
      expect(out[0].id).toBe('msg_001');
    });

    it('does not mutate the original messages array', () => {
      const original = COMPRESSIBLE;
      const messages = [{ role: 'user', content: original }];
      compressHistory(messages);
      expect(messages[0].content).toBe(original);
    });

    it('returns empty messages array and zero stats for empty input', () => {
      const { messages: out, stats } = compressHistory([]);
      expect(out).toHaveLength(0);
      expect(stats.messagesCompressed).toBe(0);
      expect(stats.totalTokensSaved).toBe(0);
    });

    it('analytics: false does not affect the return value', () => {
      const messages = [{ role: 'user', content: COMPRESSIBLE }];
      const result = compressHistory(messages, { analytics: false });
      expect(result).toHaveProperty('messages');
      expect(result).toHaveProperty('stats');
      expect(result.stats.messagesCompressed).toBe(1);
    });

    it('returns empty messages and zero stats for non-array input', () => {
      // @ts-expect-error intentional bad input
      const result = compressHistory(null);
      expect(result.messages).toHaveLength(0);
      expect(result.stats.messagesCompressed).toBe(0);
      expect(result.stats.totalTokensSaved).toBe(0);
    });
  });

  describe('short messages below compression threshold', () => {
    const SHORT = 'Hello there.'; // well under 30-word minimum

    it('returns message unchanged when content is too short to compress', () => {
      const messages = [{ role: 'user', content: SHORT }];
      const { messages: out } = compressHistory(messages);
      expect(out[0].content).toBe(SHORT);
    });

    it('does not count short messages as compressed', () => {
      const messages = [{ role: 'user', content: SHORT }];
      const { stats } = compressHistory(messages);
      expect(stats.messagesCompressed).toBe(0);
    });

    it('totalTokensSaved is 0 when no message crossed the threshold', () => {
      const messages = [
        { role: 'user', content: SHORT },
        { role: 'assistant', content: SHORT },
      ];
      const { stats } = compressHistory(messages);
      expect(stats.totalTokensSaved).toBe(0);
    });

    it('mixed short and compressible messages: only long ones counted', () => {
      const messages = [
        { role: 'user', content: SHORT },
        { role: 'assistant', content: COMPRESSIBLE },
      ];
      const { stats } = compressHistory(messages);
      expect(stats.messagesCompressed).toBe(1);
    });
  });
});
