import worker_threads from 'node:worker_threads';

// Node.js >= 21 added worker_threads.markAsUncloneable.
// In CI environments or older Node workers, undici 8.0.3+ throws:
// TypeError: webidl.util.markAsUncloneable is not a function
if (worker_threads && typeof worker_threads.markAsUncloneable !== 'function') {
  worker_threads.markAsUncloneable = () => {};
}
