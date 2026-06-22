// Using an in-memory Map as a fallback/replacement for local development without Redis
const memoryStore = new Map();

const redis = {
  set: async (key, value, mode, duration) => {
    memoryStore.set(key, value);
    if (mode === "EX" && duration) {
      setTimeout(() => {
        memoryStore.delete(key);
      }, duration * 1000);
    }
  },
  get: async (key) => memoryStore.get(key) || null,
  del: async (key) => memoryStore.delete(key),
};

console.log("✅ Using In-Memory Store for OTPs (Redis alternative)");

export default redis;