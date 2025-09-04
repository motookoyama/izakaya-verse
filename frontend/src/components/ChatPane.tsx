import React, { useEffect, useMemo, useRef, useState } from 'react';
import { postChatCompletion, postV2Chat, getV2Card } from '../lib/api';
import type { PresetValues, Provider } from './SettingsPanel';

type Message = { role: 'user'|'assistant'|'system'; content: string };

export function ChatPane(props: { selectedCardId?: string; preset: PresetValues; provider?: Provider; model?: string; mode?: 'rp'|'business'|'tool'; onReply: (text: string)=>void }) {
  const { selectedCardId, preset, provider = 'ollama', model = 'qwen3:4b', mode = 'rp', onReply } = props;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const [composing, setComposing] = useState(false);
  const [cardInfo, setCardInfo] = useState<{name?:string, description?:string, thumb?:string}|null>(null);

  useEffect(()=>{
    if (!selectedCardId) { setCardInfo(null); return; }
    getV2Card(selectedCardId).then((it:any)=>{
      setCardInfo({ name: it?.name, description: it?.meta?.description, thumb: it?.meta?.thumb });
    }).catch(()=> setCardInfo(null));
  }, [selectedCardId]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');

    try {
      let reply = '';
      if (selectedCardId) {
        const r = await postV2Chat({ cardId: selectedCardId, provider, model, mode, messages: next });
        reply = r.reply || '';
      } else {
        const r = await postChatCompletion({ provider, model, messages: next, temperature: preset.temperature, max_tokens: preset.max_tokens });
        reply = r.choices?.[0]?.message?.content || '';
      }
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
      onReply(reply);
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    } catch (e) {
      const err = String(e);
      setMessages(m => [...m, { role: 'assistant', content: `Error: ${err}` }]);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (composing) return; // 日本語変換中は送信しない
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        send();
        return;
      }
      e.preventDefault();
      send();
    }
  }

  return (
    <div style={{ display:'flex', flex:1, flexDirection:'column' }}>
      {cardInfo && (
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', borderBottom:'1px solid #eee', background:'#fafafa' }}>
          {cardInfo.thumb ? <img src={cardInfo.thumb} style={{ width:24, height:24, borderRadius:4, border:'1px solid #ddd' }} /> : <div style={{ width:24, height:24 }} />}
          <div style={{ fontSize:12, color:'#555' }}>
            <b>{cardInfo.name}</b>
            {cardInfo.description && <span style={{ marginLeft:6, color:'#888' }}>{String(cardInfo.description).slice(0,64)}</span>}
          </div>
        </div>
      )}
      <div ref={listRef} style={{ flex:1, padding:12, overflow:'auto' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin:'8px 0' }}>
            <div style={{ fontSize:12, color:'#888' }}>{m.role}</div>
            <div style={{ whiteSpace:'pre-wrap' }}>{m.content}</div>
          </div>
        ))}
      </div>
      <div style={{ borderTop:'1px solid #ddd', padding:8 }}>
        <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey}
          onCompositionStart={()=>setComposing(true)}
          onCompositionEnd={()=>setComposing(false)}
          placeholder={selectedCardId ? 'カード文脈チャット (Enterで送信, Shift+Enterで改行)' : 'チャット (Enterで送信)'}
          style={{ width:'100%', height:76, resize:'vertical', padding:8 }} />
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:6 }}>
          <button onClick={send} style={{ padding:'6px 10px', border:'1px solid #ddd', borderRadius:6, background:'#111', color:'#fff' }}>送信</button>
        </div>
      </div>
    </div>
  );
}
