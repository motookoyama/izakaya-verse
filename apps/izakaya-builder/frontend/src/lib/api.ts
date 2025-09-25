export async function getModels(provider?: string) {
  const qs = provider ? `?provider=${encodeURIComponent(provider)}` : '';
  const r = await fetch(`/api/models${qs}`);
  if (!r.ok) throw new Error(`models ${r.status}`);
  return r.json();
}

export async function postChatCompletion(body: any) {
  const r = await fetch('/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`chat ${r.status}`);
  return r.json();
}

export async function createV2Card(body: any) {
  const r = await fetch('/api/v2/cards', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' }
  });
  if (!r.ok) throw new Error(`create card ${r.status}`);
  return r.json();
}

export async function listV2Cards() {
  const r = await fetch('/api/v2/cards');
  if (!r.ok) throw new Error(`list cards ${r.status}`);
  return r.json();
}

export async function postV2Chat(body: any) {
  const r = await fetch('/api/v2/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`v2 chat ${r.status}`);
  return r.json();
}

export async function deleteV2Card(id: string) {
  const r = await fetch(`/api/v2/cards/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!r.ok) throw new Error(`delete card ${r.status}`);
  return r.json();
}

export async function getV2Card(id: string) {
  const r = await fetch(`/api/v2/cards/${encodeURIComponent(id)}`);
  if (!r.ok) throw new Error(`get card ${r.status}`);
  return r.json();
}

export async function saveFile(params: { filename: string; content: string }) {
  const r = await fetch('/api/save', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!r.ok) throw new Error(`save ${r.status}`);
  return r.json();
}
