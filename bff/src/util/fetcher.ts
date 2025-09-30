import { fetch, Request, Response, Headers } from 'undici';

export function getFetch() {
  // Node.js 18+ has native fetch, but undici provides a more consistent API
  // and is explicitly listed in dependencies.
  return fetch;
}

export { Request, Response, Headers };
