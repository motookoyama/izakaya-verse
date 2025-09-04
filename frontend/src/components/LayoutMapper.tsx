import React, { useCallback, useMemo, useRef, useState } from 'react';

export function LayoutMapper(props: { initialRatio?: number; onApply: (ratio: number) => void; onClose?: () => void }) {
  const { initialRatio = 0.46, onApply, onClose } = props;
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [guideX, setGuideX] = useState<number | null>(null);

  const ratio = useMemo(() => {
    const el = containerRef.current;
    if (!el) return initialRatio;
    const w = el.clientWidth || 1;
    if (guideX == null) return initialRatio;
    return Math.min(0.9, Math.max(0.1, guideX / w));
  }, [guideX, initialRatio]);

  const onFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const src = await fileToBase64(file);
    setImgSrc(src);
  }, []);

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    onFiles(e.dataTransfer.files);
  }

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    setDragging(true);
    updateGuide(e);
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!dragging) return;
    updateGuide(e);
  }

  function onMouseUp() { setDragging(false); }

  function updateGuide(e: React.MouseEvent<HTMLDivElement>) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setGuideX(Math.max(0, Math.min(rect.width, x)));
  }

  return (
    <div style={{ border:'1px solid #ddd', borderRadius:8, margin:12, overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:'#f8f8f8' }}>
        <div style={{ fontSize:12, color:'#555' }}>Layout Mapper（画像を読み込み、縦ガイドをドラッグして左右比率を決める）</div>
        <div>
          <button onClick={() => { setImgSrc(null); setGuideX(null); }} style={btnSm}>Reset</button>
          <button onClick={() => onApply(ratio)} style={{ ...btnSm, marginLeft:8, background:'#111', color:'#fff' }}>Apply</button>
          {onClose && <button onClick={onClose} style={{ ...btnSm, marginLeft:8 }}>Close</button>}
        </div>
      </div>
      {!imgSrc ? (
        <div onDragOver={e=>e.preventDefault()} onDrop={onDrop} style={{ padding:24, textAlign:'center' }}>
          <div style={{ marginBottom:8 }}>ここにデザイン画像をドラッグ＆ドロップ</div>
          <input type="file" accept="image/*" onChange={e=>onFiles(e.target.files)} />
        </div>
      ) : (
        <div ref={containerRef}
             onMouseDown={onMouseDown}
             onMouseMove={onMouseMove}
             onMouseUp={onMouseUp}
             onMouseLeave={()=>setDragging(false)}
             style={{ position:'relative', userSelect:'none' }}>
          <img src={imgSrc} alt="design" style={{ display:'block', width:'100%', height:'auto' }} />
          {/* vertical guide */}
          <Guide ratio={ratio} />
        </div>
      )}
    </div>
  );
}

function Guide(props: { ratio: number }) {
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
      <div style={{ position:'absolute', top:0, bottom:0, left:`${props.ratio*100}%`, transform:'translateX(-1px)', width:2, background:'#ff3b30', opacity:0.9 }} />
      <div style={{ position:'absolute', top:8, left:`calc(${props.ratio*100}% + 6px)`, background:'rgba(0,0,0,0.6)', color:'#fff', fontSize:12, padding:'2px 6px', borderRadius:4 }}>
        {Math.round(props.ratio*100)}%
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

const btnSm: React.CSSProperties = {
  padding:'4px 8px', border:'1px solid #ddd', borderRadius:6, background:'#fff', cursor:'pointer', fontSize:12
};

