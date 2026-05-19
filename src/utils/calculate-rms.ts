export function calculateRms(buf: Buffer) {
  let sum = 0;
  for (let i = 0; i < buf.length; i += 2) {
    const v = buf.readInt16LE(i) / 32768;
    sum += v * v;
  }
  return Math.sqrt(sum / (buf.length / 2));
}
