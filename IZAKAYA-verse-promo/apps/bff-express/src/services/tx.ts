export function generateTxId(date: Date = new Date()): string {
  const yyyy = date.getFullYear().toString().padStart(4, "0");
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `TX-${yyyy}${mm}${dd}-${suffix}`;
}

export function isValidTxId(input: string): boolean {
  return /^TX-\d{8}-[A-Z0-9]{6}$/.test(input);
}
