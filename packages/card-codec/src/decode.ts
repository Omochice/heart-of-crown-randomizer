export function decodeCardIds(encoded: string): number[] {
  if (encoded === "") {
    return [];
  }

  // Restore base64 padding
  let base64 = encoded;
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }

  // Convert base64url to standard base64
  base64 = base64.replaceAll("-", "+").replaceAll("_", "/");

  // Decode base64 to bytes
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Extract set bit positions as card IDs
  const result: number[] = [];
  for (let i = 0; i < bytes.length * 8; i++) {
    if (bytes[i >> 3] & (1 << (i & 7))) {
      result.push(i);
    }
  }

  return result;
}
