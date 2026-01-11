export async function onRequest(context: { request: Request; env: Record<string, string | undefined> }) {
  const url = new URL(context.request.url);
  const username = url.searchParams.get('username')?.trim().toLowerCase();
  const list = (context.env.TRACE_DENYLIST || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const blocked = Boolean(username && list.includes(username));

  return new Response(JSON.stringify({ blocked }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
