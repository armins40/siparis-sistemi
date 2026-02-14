const listeners: Set<(data: { userId: string; storeSlug: string; finalTotal: number }) => void> = new Set();

export function emitNewOrder(data: { userId: string; storeSlug: string; finalTotal: number }) {
  listeners.forEach((fn) => {
    try {
      fn(data);
    } catch (e) {
      console.error('order-events listener error:', e);
    }
  });
}

export function subscribeNewOrder(fn: (data: { userId: string; storeSlug: string; finalTotal: number }) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
