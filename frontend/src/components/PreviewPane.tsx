import React, { useMemo } from 'react';

export function PreviewPane(props: { text: string; renderHtml?: boolean }) {
  const { text, renderHtml } = props;
  const srcdoc = useMemo(() => text, [text]);
  if (renderHtml) {
    // allow-same-origin を付与し、srcdoc 内で localStorage を利用可能にする
    return (
      <div style={{ flex:1, background:'var(--bg)', color:'var(--fg)', padding:0, overflow:'hidden' }}>
        <iframe
          title="preview"
          style={{ border:0, width:'100%', height:'100%' }}
          sandbox="allow-scripts allow-forms allow-same-origin"
          srcDoc={srcdoc}
        />
      </div>
    );
  }
  return (
    <div style={{ flex:1, background:'var(--bg)', color:'var(--fg)', fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace', padding:12, overflow:'auto' }}>
      <pre style={{ margin:0, whiteSpace:'pre-wrap' }}>{text}</pre>
    </div>
  );
}
