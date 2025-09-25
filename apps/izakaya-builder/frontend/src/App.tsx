import React, { useEffect, useRef, useState } from 'react';
import { ChatPane } from './components/ChatPane';
import { PreviewPane } from './components/PreviewPane';
import { CodePad } from './components/CodePad';
import { V2Drawer } from './components/V2Drawer';
import { SettingsPanel, Preset, Provider } from './components/SettingsPanel';
import { LayoutMapper } from './components/LayoutMapper';

export function App() {
  const [activeTab, setActiveTab] = useState<'SPEC'|'V2'|'SETTINGS'>('SPEC');
  const [previewText, setPreviewText] = useState('');
  const [codePadText, setCodePadText] = useState('');
  const [syncChatToCode, setSyncChatToCode] = useState(true);
  const [renderHtml, setRenderHtml] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string|undefined>();
  const [preset, setPreset] = useState<Preset>('Neutral');
  const [provider, setProvider] = useState<Provider>('ollama');
  const [model, setModel] = useState<string>('qwen3:4b');
  const [models, setModels] = useState<string[]>([]);
  const [showMapper, setShowMapper] = useState(false);
  const [splitRatio, setSplitRatio] = useState<number>(() => {
    const layout = readLayoutFromLocal();
    if (layout?.ratios?.rightPane) return clamp(Number(layout.ratios.rightPane), 0.25, 0.85);
    const saved = localStorage.getItem('iz_split_ratio');
    return saved ? clamp(Number(saved), 0.25, 0.85) : 0.44; // 右ペイン幅の比率（適用仕様）
  });
  const [codeSplit, setCodeSplit] = useState<number>(() => {
    const layout = readLayoutFromLocal();
    if (layout?.ratios?.codePreview) return clamp(Number(layout.ratios.codePreview), 0.15, 0.85);
    const saved = localStorage.getItem('iz_code_split_ratio');
    return saved ? clamp(Number(saved), 0.15, 0.85) : 0.42; // 右ペイン内の上下比率（適用仕様）
  });
  const [fullscreen, setFullscreen] = useState(false);

  const bodyRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  // 右ペイン初期モデル一覧（任意）
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/models?provider=${encodeURIComponent(provider)}`);
        const j = await r.json();
        const list = Array.isArray(j?.models) ? (j.models as string[]) : [];
        setModels(list);
        if (list.length && !list.includes(model)) setModel(list[0]);
      } catch {/* noop */}
    })();
  }, [provider]);

  const rightPct = Math.round(splitRatio * 1000) / 10; // 表示用
  const leftPct = 100 - rightPct;

  // 一度だけ、パレットのCSS変数を適用（localStorageの iz_layout を使用）
  useEffect(() => {
    const layout = ensureLayout();
    applyPalette(layout?.palette || defaultPalette());
  }, []);

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column' }}>
      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', borderBottom:'1px solid var(--border)', background:'#fff' }}>
        <div>
          <button onClick={() => setActiveTab('SPEC')} style={tabStyle(activeTab==='SPEC')}>SPEC</button>
          <button onClick={() => setActiveTab('V2')} style={tabStyle(activeTab==='V2')}>V2 Cards</button>
          <button onClick={() => setActiveTab('SETTINGS')} style={tabStyle(activeTab==='SETTINGS')}>Settings</button>
        </div>
        <div>
          <button style={btnStyle}>Run</button>
          <button style={btnStyle}>Deploy</button>
          <button style={btnStyle}>Codex</button>
        </div>
      </div>

      {/* Body with resizable columns */}
      <div ref={bodyRef} style={{ flex:1, position:'relative', minHeight:0 }}>
        {/* Left column */}
        <div style={{ position:'absolute', top:0, bottom:0, left:0, width:`calc(${leftPct}% - 3px)`, minWidth:160, display:'flex', flexDirection:'column', borderRight:'1px solid var(--border)' }}>
          <div style={{ padding:'8px 12px', borderBottom:'1px solid var(--border)', background:'#fafafa', fontSize:12, color:'#555' }}>Left Pane: Chat</div>
          <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column' }}>
            <ChatPane selectedCardId={selectedCardId} preset={preset as any} provider={provider as any} model={model}
              onReply={(text) => {
                setPreviewText(text);
                if (syncChatToCode) {
                  const code = extractFirstCodeBlock(text) ?? text;
                  setCodePadText(code);
                }
              }}
            />
          </div>
        </div>

        {/* Divider (vertical) */}
        <div onMouseDown={(e)=>startDragVertical(e, bodyRef, setSplitRatio)} title="ドラッグで左右比率を調整"
             style={{ position:'absolute', top:0, bottom:0, left:`calc(${leftPct}% - 3px)`, width:6, cursor:'col-resize', zIndex:5, background:'rgba(0,0,0,0.05)' }} />

        {/* Right column */}
        <div ref={rightRef} style={{ position:'absolute', top:0, bottom:0, right:0, width:`${rightPct}%`, minWidth:360, display:'flex', flexDirection:'column', background:'#fff' }}>
          {activeTab === 'SPEC' && (
            <div style={{ display:'flex', flexDirection:'column', minHeight:0, height:'100%' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', borderBottom:'1px solid var(--border)', background:'#fafafa' }}>
                <label style={{ fontSize:12, color:'#555' }}>
                  <input type="checkbox" checked={syncChatToCode} onChange={(e)=>setSyncChatToCode(e.target.checked)} /> Chat返信をCodePadへ反映
                </label>
                <div>
                  <button onClick={()=>setRenderHtml(false)} style={toggleBtn(!renderHtml)}>Text</button>
                  <button onClick={()=>setRenderHtml(true)} style={toggleBtn(renderHtml)}>HTML</button>
                  <button onClick={()=>setShowMapper(s=>!s)} style={{ ...btnStyle, marginLeft:8 }}>Layout Mapper</button>
                  <button onClick={()=>onSave(codePadText)} style={{ ...btnStyle, marginLeft:8 }}>Save</button>
                  <button onClick={()=>openInNewTab(renderHtml ? (codePadText||'') : (previewText||''))} style={{ ...btnStyle, marginLeft:8 }}>Open Tab</button>
                  <button onClick={()=>setFullscreen(true)} style={{ ...btnStyle, marginLeft:8 }}>Fullscreen</button>
                </div>
              </div>

              {showMapper && (
                <LayoutMapper
                  initialRatio={splitRatio}
                  onApply={(r) => { setSplitRatio(r); localStorage.setItem('iz_split_ratio', String(r)); setShowMapper(false); }}
                  onClose={() => setShowMapper(false)}
                />
              )}

              {/* Top: CodePad (resizable) */}
              <div style={{ position:'relative', height:`${Math.round(codeSplit*1000)/10}%`, minHeight:120, borderBottom:'1px solid var(--border)', background:'var(--bg)', color:'var(--fg)' }}>
                <div style={{ padding:'6px 12px', fontSize:12, color:'#aaa' }}>Right Pane: CodePad</div>
                <CodePad value={codePadText} onChangeText={(t)=> { setCodePadText(t); setPreviewText(t); }} />
                <div onMouseDown={(e)=>startDragHorizontal(e, rightRef, setCodeSplit)}
                     title="ドラッグで上下比率を調整"
                     style={{ position:'absolute', left:0, right:0, bottom:-3, height:6, cursor:'row-resize', background:'rgba(0,0,0,0.15)' }} />
              </div>

              {/* Bottom: Preview */}
              <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column' }}>
                <div style={{ padding:'6px 12px', borderBottom:'1px solid var(--border)', background:'#fafafa', fontSize:12, color:'#555' }}>Preview</div>
                <div style={{ flex:1, minHeight:0 }}>
                  <PreviewPane text={renderHtml ? (codePadText || '') : (previewText || 'ここに最新の出力が表示されます')} renderHtml={renderHtml} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'V2' && (
            <V2Drawer onSelect={(id)=>setSelectedCardId(id)} onCardListChange={()=>{}} />
          )}

          {activeTab === 'SETTINGS' && (
            <SettingsPanel preset={preset} onChange={setPreset} provider={provider} onChangeProvider={setProvider}
              model={model} models={models} onChangeModel={setModel}
              onRefreshModels={async ()=>{
                try {
                  const r = await fetch(`/api/models?provider=${encodeURIComponent(provider)}`);
                  const j = await r.json();
                  const list = Array.isArray(j?.models) ? j.models as string[] : [];
                  setModels(list);
                  if (list.length && !list.includes(model)) setModel(list[0]);
                } catch {/* noop */}
              }}
            />
          )}
        </div>
      </div>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', background:'#111', color:'#fff' }}>
            <div>Fullscreen Preview</div>
            <div>
              <button onClick={()=>openInNewTab(renderHtml ? (codePadText||'') : (previewText||''))} style={{ ...btnStyle, marginRight:8 }}>Open Tab</button>
              <button onClick={()=>setFullscreen(false)} style={{ ...btnStyle, background:'#fff' }}>Close</button>
            </div>
          </div>
          <div style={{ flex:1, minHeight:0, background:'#111', padding:12 }}>
            <PreviewPane text={renderHtml ? (codePadText || '') : (previewText || '')} renderHtml={renderHtml} />
          </div>
        </div>
      )}
    </div>
  );
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding:'6px 10px', marginRight:8, borderRadius:6,
    border:'1px solid #ddd', background: active ? '#111' : '#fff', color: active ? '#fff' : '#111', cursor:'pointer'
  }
}

const btnStyle: React.CSSProperties = {
  padding:'6px 10px', border:'1px solid #ddd', borderRadius:6, background:'#fff', cursor:'pointer'
};

function extractFirstCodeBlock(text: string): string | null {
  const m = text.match(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/);
  if (m && m[1]) return m[1].trim();
  return null;
}

function toggleBtn(active: boolean): React.CSSProperties {
  return {
    padding:'6px 10px', marginLeft:8, borderRadius:6, border:'1px solid #ddd',
    background: active ? '#111' : '#fff', color: active ? '#fff' : '#111', cursor:'pointer'
  }
}

function openInNewTab(content: string) {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank','noopener');
  setTimeout(()=>URL.revokeObjectURL(url), 30_000);
}

function clamp(n: number, min: number, max: number) { return Math.min(max, Math.max(min, n)); }

type Layout = {
  ratios?: { rightPane?: number; codePreview?: number };
  palette?: { bg?: string; fg?: string; accent?: string; border?: string };
};

function defaultPalette() { return { bg: '#111111', fg: '#eaeaea', accent: '#d71a1a', border: '#e5e7eb' }; }

function readLayoutFromLocal(): Layout | null {
  try { const s = localStorage.getItem('iz_layout'); if (!s) return null; return JSON.parse(s); } catch { return null; }
}

function ensureLayout(): Layout {
  let j = readLayoutFromLocal();
  if (!j) {
    j = { ratios: { rightPane: 0.44, codePreview: 0.42 }, palette: defaultPalette() };
    try { localStorage.setItem('iz_layout', JSON.stringify(j)); } catch {}
  }
  return j;
}

function applyPalette(pal?: { bg?: string; fg?: string; accent?: string; border?: string }) {
  const root = document.documentElement;
  const p = { ...defaultPalette(), ...(pal||{}) } as any;
  root.style.setProperty('--bg', p.bg);
  root.style.setProperty('--fg', p.fg);
  root.style.setProperty('--accent', p.accent);
  root.style.setProperty('--border', p.border);
}

// Drag handlers
function startDragVertical(e: React.MouseEvent, bodyRef: React.RefObject<HTMLDivElement>, setRatio: (n:number)=>void) {
  e.preventDefault();
  const root = bodyRef.current!;
  const originalUserSelect = document.body.style.userSelect;
  document.body.style.userSelect = 'none';
  let lastRatio = 0;
  const handleMove = (ev: MouseEvent) => {
    const rect = root.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    lastRatio = clamp(1 - x/rect.width, 0.25, 0.85);
    setRatio(lastRatio);
  };
  const handleUp = () => {
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleUp);
    document.body.style.userSelect = originalUserSelect;
    if (lastRatio) localStorage.setItem('iz_split_ratio', String(lastRatio));
  };
  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleUp);
}

function startDragHorizontal(e: React.MouseEvent, rightRef: React.RefObject<HTMLDivElement>, setRatio: (n:number)=>void) {
  e.preventDefault();
  const pane = rightRef.current!;
  const originalUserSelect = document.body.style.userSelect;
  document.body.style.userSelect = 'none';
  let lastRatio = 0;
  const handleMove = (ev: MouseEvent) => {
    const rect = pane.getBoundingClientRect();
    const y = ev.clientY - rect.top;
    lastRatio = clamp(y/rect.height, 0.15, 0.85);
    setRatio(lastRatio);
  };
  const handleUp = () => {
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleUp);
    document.body.style.userSelect = originalUserSelect;
    if (lastRatio) localStorage.setItem('iz_code_split_ratio', String(lastRatio));
  };
  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleUp);
}

async function onSave(content: string) {
  try {
    const def = `sample-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'')}.html`;
    const name = window.prompt('保存ファイル名（.html）', def);
    if (!name) return;
    const { saveFile } = await import('./lib/api');
    const res = await saveFile({ filename: name, content });
    alert(`Saved: ${res.path} (bytes: ${res.bytes})`);
  } catch (e) {
    alert(`Save failed: ${String(e)}`);
  }
}
