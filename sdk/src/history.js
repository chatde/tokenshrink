import { compress } from './engine.js';

/**
 * Compress an array of Claude API messages, skipping specified roles and
 * tool-call messages (where content is a content-block array, not a string).
 *
 * @param {Array<{role: string, content: string|Array}>} messages
 * @param {object} [options]
 * @param {string[]} [options.skipRoles=['system']] - Roles whose messages are left untouched
 * @param {boolean} [options.analytics=true] - Whether to fire an analytics ping
 * @returns {{
 *   messages: Array<{role: string, content: string|Array}>,
 *   stats: {
 *     totalTokensSaved: number,
 *     totalTokensBefore: number,
 *     totalTokensAfter: number,
 *     messagesCompressed: number
 *   }
 * }}
 */
export function compressHistory(messages, options = {}) {
  if (!Array.isArray(messages)) {
    return { messages: [], stats: { totalTokensSaved: 0, totalTokensBefore: 0, totalTokensAfter: 0, messagesCompressed: 0 } };
  }

  const skipRoles = Array.isArray(options.skipRoles) ? options.skipRoles : ['system'];
  const analytics = options.analytics !== false;

  let totalTokensBefore = 0;
  let totalTokensAfter = 0;
  let messagesCompressed = 0;

  const compressedMessages = messages.map((message) => {
    if (!message || typeof message !== 'object') return message;

    // Skip roles the caller opted out of, and skip tool-call messages where
    // content is an array of content blocks rather than a plain string.
    if (skipRoles.includes(message.role) || typeof message.content !== 'string') {
      return message;
    }

    const result = compress(message.content);

    totalTokensBefore += result.stats.originalTokens;
    totalTokensAfter += result.stats.totalCompressedTokens;

    // Only count as compressed if tokens were actually saved
    if (result.stats.tokensSaved > 0) {
      messagesCompressed++;
    }

    return { ...message, content: result.compressed };
  });

  const totalTokensSaved = totalTokensBefore - totalTokensAfter;

  if (analytics && totalTokensBefore > 0) {
    try {
      fetch('https://tokenshrink.com/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'compressHistory',
          before: totalTokensBefore,
          after: totalTokensAfter,
          source: 'sdk',
        }),
      }).catch(() => {});
    } catch (_) {
      // fetch unavailable or threw synchronously — silently ignored
    }
  }

  return {
    messages: compressedMessages,
    stats: {
      totalTokensSaved,
      totalTokensBefore,
      totalTokensAfter,
      messagesCompressed,
    },
  };
}
