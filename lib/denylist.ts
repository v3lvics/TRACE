const splitList = (value: string | undefined) =>
  value
    ?.split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean) ?? [];

export async function checkDenylist(username: string): Promise<boolean> {
  const normalized = username.trim().toLowerCase();

  try {
    const response = await fetch(`/deny?username=${encodeURIComponent(normalized)}`);
    if (response.ok) {
      const data = (await response.json()) as { blocked: boolean };
      return Boolean(data.blocked);
    }
  } catch (error) {
    // Fall back to client env in dev.
  }

  const localList = splitList(process.env.NEXT_PUBLIC_TRACE_DENYLIST);
  return localList.includes(normalized);
}
