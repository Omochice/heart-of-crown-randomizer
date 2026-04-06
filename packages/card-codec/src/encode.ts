export function encodeId(ids: number[]): string {
  if (ids.length === 0) {
    return "";
  }

  const maxId = ids.reduce((max, id) => Math.max(max, id), 0);
  const byteCount = Math.ceil((maxId + 1) / 8);
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

  const binaryString = Array.from(trimmed, (byte) =>
    String.fromCharCode(byte),
  ).join("");
  return btoa(binaryString)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}
