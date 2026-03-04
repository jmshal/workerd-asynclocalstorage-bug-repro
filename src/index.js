import { AsyncLocalStorage } from 'node:async_hooks';

const store = new AsyncLocalStorage();

export default {
  fetch() {
    const outerValue = crypto.randomUUID();
    ({ [outerValue]: `value doesn't matter here` });
    return store.run(outerValue, () => {
      try {
        for (let i = 0; i < 1_000; i++) {
          const storeValue = store.getStore();
          if (!storeValue) {
            throw new Error(`Failed on attempt ${i}.`);
          }
          for (let j = 0; j < 100; j++) {
            (() => Math.random())(); // ❌
            // (() => {})(); // ✅
            // [null].map(() => {}); // ❌
            // [null].forEach(() => {}); // ✅
          }
        }
      } catch (err) {
        console.error(err);
        return Response.json({ error: `${err}` }, { status: 500 });
      }
      return Response.json({ success: true });
    });
  },
};
