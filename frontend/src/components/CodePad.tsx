import React from 'react';

export function CodePad(props: { value: string; onChangeText: (t: string)=>void }) {
  const { value, onChangeText } = props;
  return (
    <div style={{ padding:12, background:'var(--bg)', color:'var(--fg)', display:'flex', flexDirection:'column', gap:8, height:'100%', boxSizing:'border-box' }}>
      <div style={{ fontSize:12, color:'#aaa' }}>Coding Box (SPEC)</div>
      <div style={{ flex:1, minHeight:0, display:'flex' }}>
        <textarea
          value={value}
          onChange={e=>onChangeText(e.target.value)}
          placeholder={'ここにテキストやコードを入力（プレビューに反映）'}
          style={{ flex:1, minHeight:0, height:'100%', resize:'vertical', padding:8, fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', background:'var(--bg)', color:'var(--fg)', border:'1px solid var(--border)', borderRadius:8, boxSizing:'border-box' }}
        />
      </div>
    </div>
  );
}
