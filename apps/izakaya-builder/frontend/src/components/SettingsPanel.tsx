import React from 'react';

export type Preset = 'Low' | 'Neutral' | 'Top';
export type PresetValues = { temperature: number; max_tokens: number };
export type Provider = 'ollama' | 'openai' | 'gemini' | 'lmstudio' | 'openrouter';

const PRESET_VALUES: Record<Preset, PresetValues> = {
  Low: { temperature: 0.2, max_tokens: 256 },
  Neutral: { temperature: 0.7, max_tokens: 512 },
  Top: { temperature: 1.0, max_tokens: 1024 }
};

export function SettingsPanel(props: { preset: Preset; onChange: (p: Preset)=>void; provider?: Provider; onChangeProvider?: (v: Provider)=>void; model?: string; models?: string[]; onChangeModel?: (m: string)=>void; onRefreshModels?: ()=>void; mode?: 'rp'|'business'|'tool'; onChangeMode?: (m:'rp'|'business'|'tool')=>void }) {
  return (
    <div style={{ padding:16 }}>
      <div style={{ marginBottom:12 }}>ギア設定（送信時に反映）</div>
      <div>
        {(['Low','Neutral','Top'] as Preset[]).map(p => (
          <label key={p} style={{ marginRight:12 }}>
            <input type="radio" name="preset" checked={props.preset===p} onChange={()=>props.onChange(p)} /> {p}
          </label>
        ))}
      </div>
      <div style={{ marginTop:12, color:'#555', fontSize:12 }}>
        現在: temperature={PRESET_VALUES[props.preset].temperature} / max_tokens={PRESET_VALUES[props.preset].max_tokens}
      </div>
      <div style={{ marginTop:16 }}>
        <div style={{ marginBottom:6 }}>プロバイダ</div>
        <select value={props.provider || 'ollama'} onChange={e=>props.onChangeProvider && props.onChangeProvider(e.target.value as Provider)}>
          <option value="ollama">ollama（ローカル）</option>
          <option value="lmstudio">LM Studio（ローカル）</option>
          <option value="openai">openai</option>
          <option value="openrouter">openrouter</option>
          <option value="gemini">gemini</option>
        </select>
      </div>
      <div style={{ marginTop:12 }}>
        <div style={{ marginBottom:6 }}>モード</div>
        <label style={{ marginRight:12 }}><input type="radio" name="mode" checked={(props.mode||'rp')==='rp'} onChange={()=>props.onChangeMode && props.onChangeMode('rp')} /> RP</label>
        <label style={{ marginRight:12 }}><input type="radio" name="mode" checked={props.mode==='business'} onChange={()=>props.onChangeMode && props.onChangeMode('business')} /> Business</label>
        <label><input type="radio" name="mode" checked={props.mode==='tool'} onChange={()=>props.onChangeMode && props.onChangeMode('tool')} /> Tool</label>
      </div>
      <div style={{ marginTop:12 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
          <div>モデル</div>
          <button onClick={props.onRefreshModels} style={{ padding:'4px 8px', border:'1px solid #ddd', borderRadius:6, background:'#fff', cursor:'pointer', fontSize:12 }}>更新</button>
        </div>
        {(props.models && props.models.length > 0) ? (
          <select value={props.model || ''} onChange={e=>props.onChangeModel && props.onChangeModel(e.target.value)}>
            {props.models.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        ) : (
          <div>
            <div style={{ fontSize:12, color:'#999', marginBottom:6 }}>モデルが取得できませんでした。モデル名を直接入力して試すこともできます。</div>
            <input type="text" placeholder="モデル名を入力（例: qwen3:4b, gpt-4o-mini, gemini-1.5-pro）" style={{ width:'100%', padding:'6px', border:'1px solid #ddd', borderRadius:6 }}
              onChange={e=>props.onChangeModel && props.onChangeModel(e.target.value)} />
          </div>
        )}
      </div>
    </div>
  );
}

export function presetToValues(p: Preset): PresetValues {
  return PRESET_VALUES[p];
}
