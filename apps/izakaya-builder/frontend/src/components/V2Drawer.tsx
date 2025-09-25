import React, { useEffect, useRef, useState } from 'react';
import { createV2Card, listV2Cards, deleteV2Card } from '../lib/api';

type Item = { id: string; name: string; meta: any; createdAt: number };

export function V2Drawer(props: { onSelect: (id: string)=>void; onCardListChange: ()=>void }) {
  const { onSelect } = props;
  const [items, setItems] = useState<Item[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string>('Sample Card');
  const [description, setDescription] = useState<string>('');

  async function refresh() {
    const r = await listV2Cards();
    setItems(r.items || []);
  }

  useEffect(() => { refresh(); }, []);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const base64 = await fileToBase64(file);
    const thumb = await fileToThumbDataUrl(file);
    await createV2Card({ imageBase64: base64, name, description, thumbDataUrl: thumb });
    await refresh();
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    onFiles(e.dataTransfer.files);
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, minHeight:0 }}>
      <div style={{ padding:'0 12px' }}>
        <div style={{ marginBottom:8 }}>
          <label style={{ display:'block', fontSize:12, color:'#666', marginBottom:4 }}>Card Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} style={{ width:'100%', padding:6, border:'1px solid #ddd', borderRadius:6 }} />
        </div>
        <div style={{ marginBottom:8 }}>
          <label style={{ display:'block', fontSize:12, color:'#666', marginBottom:4 }}>Character Description（任意）</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder={'キャラクターの説明・口調・背景など（UIには表示されません）'}
            style={{ width:'100%', height:72, padding:6, border:'1px solid #ddd', borderRadius:6, resize:'vertical' }} />
        </div>
      </div>
      <div
        onDragOver={e=>e.preventDefault()}
        onDrop={onDrop}
        style={{ margin:12, padding:20, border:'2px dashed #888', borderRadius:8, textAlign:'center' }}
      >
        画像をここにドラッグ＆ドロップ（または）
        <div style={{ marginTop:8 }}>
          <input ref={fileRef} type="file" accept="image/*" onChange={e=>onFiles(e.target.files)} />
        </div>
      </div>
      <div style={{ padding:'0 12px', overflow:'auto' }}>
        {items.map(it => (
          <div key={it.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 6px', borderBottom:'1px solid #eee' }}>
            {it.meta?.thumb ? (
              <img src={it.meta.thumb} alt="thumb" style={{ width:36, height:36, objectFit:'cover', borderRadius:4, border:'1px solid #ddd' }} />
            ) : <div style={{ width:36, height:36, border:'1px solid #ddd', borderRadius:4, background:'#fafafa' }} />}
            <div style={{ flex:1, minWidth:0, cursor:'pointer' }} onClick={()=>onSelect(it.id)}>
              <div style={{ fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{it.name}</div>
              <div style={{ fontSize:12, color:'#666' }}>{new Date(it.createdAt).toLocaleString()}</div>
              {it.meta?.description && (
                <div style={{ fontSize:11, color:'#888', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{String(it.meta.description).slice(0,60)}</div>
              )}
            </div>
            <button onClick={async ()=>{ await deleteV2Card(it.id); await refresh(); }} style={{ padding:'4px 6px', border:'1px solid #ddd', borderRadius:6, background:'#fff' }}>Eject</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Optional: create a small thumbnail data URL for preview
async function fileToThumbDataUrl(file: File, maxSide=64): Promise<string> {
  const dataUrl = await fileToBase64(file);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(maxSide / img.width, maxSide / img.height, 1);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = dataUrl;
  });
}
