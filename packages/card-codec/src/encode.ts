export function encodeCardIds(ids: number[]): string {
  if (ids.length === 0) {
    return "";
  }

  const byteCount = Math.ceil((Math.max(...ids) + 1) / 8);
  const bytes = new Uint8Array(byteCount);
  for (const id of ids) {
    bytes[id >> 3] |= 1 << (id & 7);
  }

  // Strip trailing zero bytes to produce shorter output for lower card IDs
  let end = bytes.length;
  while (end > 0 && bytes[end - 1] === 0) {
    end--;
  }
  const trimmed = bytes.subarray(0, end);

  return btoa(String.fromCharCode(...trimmed))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
