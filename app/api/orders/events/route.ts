import { subscribeNewOrder } from '@/lib/order-events';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return new Response('userId required', { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const unsubscribe = subscribeNewOrder((data) => {
        if (data.userId !== userId) return;
        const line = `data: ${JSON.stringify({
          type: 'new_order',
          finalTotal: data.finalTotal,
          storeSlug: data.storeSlug,
        })}\n\n`;
        controller.enqueue(encoder.encode(line));
      });
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(': keepalive\n\n'));
      }, 25000);
      request.signal?.addEventListener('abort', () => {
        clearInterval(keepAlive);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
