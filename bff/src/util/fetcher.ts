import { fetch as undiciFetch } from 'undici';

export function getFetch(): typeof fetch {
  // Node 18+ has global fetch, Node 16はundiciのfetchを利用
  // @ts-ignore
  return (globalThis as any).fetch ? (globalThis as any).fetch : undiciFetch as any;
}

