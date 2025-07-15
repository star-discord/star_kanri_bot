// utils/tempStore.js
// A simple in-memory store for temporary data between interactions.
// This is a basic implementation. For production, consider a more robust
// solution like Redis if the bot needs to be sharded or have persistent temp data.
const tempStore = new Map();

// Periodically clean up old entries to prevent memory leaks.
setInterval(() => {
  const now = Date.now();
  const aDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  for (const [key, value] of tempStore.entries()) {
    if (now - value.timestamp > aDay) {
      tempStore.delete(key);
      console.log(`[tempStore] Cleaned up expired entry: ${key}`);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour.

module.exports = { tempStore };