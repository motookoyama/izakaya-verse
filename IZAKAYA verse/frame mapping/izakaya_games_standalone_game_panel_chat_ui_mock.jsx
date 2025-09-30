import React from "react";

// IZAKAYA games — Standalone Game Panel + Chat (UI Mock)
// - Visual-only mock (no game logic)
// - Left: wide TV monitor style game window (16:9)
// - Retro controller (D-Pad + A/B + Start/Select)
// - Right: separate chatbot field (log + input)
// TailwindCSS expected. No external libs.

export default function IzakayaStandaloneGamePage() {
  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100">
      <header className="px-6 pt-6 pb-3 flex items-center justify-between">
        <div className="text-xs tracking-widest text-neutral-400 uppercase">IZAKAYA games</div>
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span>UI Mock • v0</span>
          <span className="hidden sm:inline">/ Standalone Game Panel + Chat</span>
        </div>
      </header>

      <main className="px-6 pb-8 grid gap-6 md:grid-cols-[1.6fr_0.9fr]">
        {/* LEFT: GAME PANEL */}
        <section className="space-y-4">
          {/* TV Monitor Frame */}
          <div className="relative rounded-3xl p-4 bg-gradient-to-b from-neutral-900 to-neutral-800 shadow-2xl border border-neutral-700">
            {/* bezel / brand bar */}
            <div className="absolute -top-2 right-6 text-[10px] text-neutral-400 select-none">RETRO/TV-16:9</div>

            {/* 16:9 playable area */}
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-neutral-700 bg-[#0b0b0d]">
              {/* subtle vignette & glass */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5 mix-blend-overlay" />

              {/* sample field (placeholder tiles) */}
              <div className="absolute inset-0 grid place-items-center">
                <div className="grid grid-cols-14 gap-[3px] opacity-90">
                  {Array.from({ length: 14 * 8 }).map((_, i) => (
                    <div
                      key={i}
                      className={[
                        "w-6 h-6 rounded-[4px] border border-neutral-800",
                        i % 7 === 0 ? "bg-neutral-800" : "bg-neutral-900",
                      ].join(" ")}
                    />
                  ))}
                </div>
              </div>

              {/* mock sprites */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid grid-cols-3 gap-3">
                <div className="w-6 h-6 rounded-md bg-emerald-500 shadow" />
                <div className="w-6 h-6 rounded-md bg-red-500 shadow" />
                <div className="w-6 h-6 rounded-md bg-amber-400 shadow" />
              </div>

              {/* HUD sample */}
              <div className="absolute left-3 top-3 flex items-center gap-2 text-[11px]">
                <span className="px-2 py-[2px] rounded-full bg-emerald-600/20 border border-emerald-400 text-emerald-200">HP 20/20</span>
                <span className="px-2 py-[2px] rounded-full bg-sky-600/20 border border-sky-400 text-sky-200">MP 10/10</span>
              </div>
              <div className="absolute right-3 bottom-3 text-[10px] text-neutral-400">Facing E</div>
            </div>
          </div>

          {/* Retro Controller */}
          <div className="rounded-2xl p-4 bg-neutral-900/80 border border-neutral-700 shadow-xl">
            <div className="grid grid-cols-3 gap-6">
              {/* D-Pad */}
              <div className="flex items-center justify-center">
                <div className="relative grid place-items-center">
                  <div className="w-28 h-28 rounded-xl bg-neutral-800 border border-neutral-700 shadow-inner"></div>
                  {/* arrows */}
                  <button className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-neutral-700 hover:bg-neutral-600 border border-neutral-500 text-sm">↑</button>
                  <button className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-neutral-700 hover:bg-neutral-600 border border-neutral-500 text-sm">↓</button>
                  <button className="absolute left-[-8px] top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-neutral-700 hover:bg-neutral-600 border border-neutral-500 text-sm">←</button>
                  <button className="absolute right-[-8px] top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-neutral-700 hover:bg-neutral-600 border border-neutral-500 text-sm">→</button>
                </div>
              </div>

              {/* Start / Select */}
              <div className="flex items-center justify-center gap-4">
                <button className="px-4 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-xs tracking-wider uppercase">Select</button>
                <button className="px-4 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-xs tracking-wider uppercase">Start</button>
              </div>

              {/* A / B Buttons */}
              <div className="flex items-center justify-center gap-6">
                <button className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 border-4 border-rose-300 shadow-md active:scale-95 transition" aria-label="A" />
                <button className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 border-4 border-amber-200 shadow-md active:scale-95 transition" aria-label="B" />
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: CHAT CONTAINER */}
        <aside className="rounded-3xl p-4 bg-neutral-900/80 border border-neutral-700 shadow-xl flex flex-col min-h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-700">
            <div className="text-xs uppercase tracking-wider text-neutral-400">IZAKAYA V2 Chat</div>
            <span className="px-2 py-[2px] rounded-full text-[10px] bg-emerald-600/20 border border-emerald-400 text-emerald-200">Ready</span>
          </div>

          {/* log */}
          <div className="flex-1 overflow-auto pr-1 mt-3 space-y-2">
            {MOCK_LOG.map((m, i) => (
              <div key={i} className={[
                "text-sm leading-snug",
                m.who === "comp" ? "text-emerald-300" : m.who === "sys" ? "text-neutral-400" : "",
              ].join(" ")}>{{ sys: `● ${m.text}`, comp: `◇ ${m.text}`, you: m.text }[m.who]}</div>
            ))}
          </div>

          {/* input */}
          <form className="pt-3 flex gap-2">
            <input className="flex-1 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" placeholder="メッセージを入力（モック）" />
            <button type="button" className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400">送信</button>
          </form>
        </aside>
      </main>

      <footer className="px-6 py-6 text-[11px] text-neutral-500">
        <span className="mr-2">※ 見た目のみのモックです（ロジック未実装）</span>
        <span>BIGV2素材やVチャットは右側の受け口に差し込む想定。</span>
      </footer>
    </div>
  );
}

// lightweight placeholder chat log
const MOCK_LOG: { who: "you" | "comp" | "sys"; text: string }[] = [
  { who: "sys", text: "IZAKAYA games: UI mock loaded" },
  { who: "comp", text: "準備OK。A/Bは後で割り当てよう。" },
  { who: "you", text: "画面比はこのままで。" },
  { who: "comp", text: "了解。チャットは右に固定するね。" },
];
