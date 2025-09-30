# .sAtd: IZAKAYA Event Pack — Weekly (7) / Monthly (12) / News
[PACK]
id: "events-std-7x12-news"
name: "Standard Weekly & Monthly & News Pack"
version: "1.0"
language: "ja"
default_bias: 0.15

[GUIDE]
# 目的: 運用の手間を最小化。週間は曜日固定の7種。月間は月固定の12種。
# Newsは1件だけ軽く差し込むテンプレ。すべて propose_only（強制なし）。
# RRULE/窓はローカルタイム基準。bias_strengthは 0.1–0.2 を推奨。

# ─────────────── 週間（7種／固定） ───────────────
[EVENT:weekly-mon]
id: "weekly-mon"
name: "月曜・ウォームアップ"
type: "weekly_daily"
trigger: { rrule: "FREQ=WEEKLY;BYDAY=MO;BYHOUR=18;BYMINUTE=0" }
propose_text: { ja: "月曜のおしゃべりを軽くウォームアップします。参加しますか？" }
on_accept:
  bias_keywords: ["近況","軽い目標","無理しない","今週の予定"]
  system_preface: { ja: "（今日は肩慣らしの雑談を少し優先します）" }
  bias_strength: 0.12

[EVENT:weekly-tue]
id: "weekly-tue"
name: "火曜・学びスパイス"
type: "weekly_daily"
trigger: { rrule: "FREQ=WEEKLY;BYDAY=TU;BYHOUR=18;BYMINUTE=0" }
propose_text: { ja: "小さな学びネタを振ります。参加しますか？" }
on_accept:
  bias_keywords: ["豆知識","小ワザ","TIPS","ひらめき"]
  bias_strength: 0.12

[EVENT:weekly-wed]
id: "weekly-wed"
name: "水曜・ミッドウィーク励まし"
type: "weekly_daily"
trigger: { rrule: "FREQ=WEEKLY;BYDAY=WE;BYHOUR=18;BYMINUTE=0" }
propose_text: { ja: "週の中盤、少し励ましを添えます。参加しますか？" }
on_accept:
  bias_keywords: ["進捗","ねぎらい","小休止","切替"]
  bias_strength: 0.12

[EVENT:weekly-thu]
id: "weekly-thu"
name: "木曜・クリエイティブ小話"
type: "weekly_daily"
trigger: { rrule: "FREQ=WEEKLY;BYDAY=TH;BYHOUR=18;BYMINUTE=0" }
propose_text: { ja: "創作やアイデアの小話を少しだけ。参加しますか？" }
on_accept:
  bias_keywords: ["発想","下書き","インスピレーション","試作"]
  bias_strength: 0.12

[EVENT:weekly-fri]
id: "weekly-fri"
name: "金曜・週末プラン"
type: "weekly_daily"
trigger: { rrule: "FREQ=WEEKLY;BYDAY=FR;BYHOUR=18;BYMINUTE=0" }
propose_text: { ja: "週末の過ごし方の話題を少し。参加しますか？" }
on_accept:
  bias_keywords: ["気晴らし","小旅行","映画/読書","休息"]
  bias_strength: 0.14

[EVENT:weekly-sat]
id: "weekly-sat"
name: "土曜・趣味カフェ"
type: "weekly_daily"
trigger: { rrule: "FREQ=WEEKLY;BYDAY=SA;BYHOUR=12;BYMINUTE=0" }
propose_text: { ja: "趣味や推しの話を軽めに。参加しますか？" }
on_accept:
  bias_keywords: ["コレクション","作品語り","推し活","沼"]
  bias_strength: 0.14

[EVENT:weekly-sun]
id: "weekly-sun"
name: "日曜・リセット＆準備"
type: "weekly_daily"
trigger: { rrule: "FREQ=WEEKLY;BYDAY=SU;BYHOUR=18;BYMINUTE=0" }
propose_text: { ja: "一週間のリセットと来週準備。参加しますか？" }
on_accept:
  bias_keywords: ["振り返り","片付け","仕込み","整える"]
  bias_strength: 0.12

# ─────────────── 月間（12種／固定） ───────────────
# window はその月の 1日〜末日（簡易化）。表示は月初の初回提案のみを推奨。
[EVENT:month-01]
id: "month-01"
name: "1月・新年セット"
type: "annual_calendar"
trigger: { window: { start: "YYYY-01-01", end: "YYYY-01-31" } }
propose_text: { ja: "新年の目標や楽しみを軽く扱います。参加しますか？" }
on_accept:
  bias_keywords: ["抱負","初詣","書き初め","リセット"]
  bias_strength: 0.16

[EVENT:month-02]
id: "month-02"
name: "2月・ぬくもりセット"
type: "annual_calendar"
trigger: { window: { start: "YYYY-02-01", end: "YYYY-02-28" } }
propose_text: { ja: "寒さ対策や室内の楽しみを中心に。参加しますか？" }
on_accept:
  bias_keywords: ["ホットドリンク","読書","映画","防寒"]
  bias_strength: 0.16

[EVENT:month-03]
id: "month-03"
name: "3月・芽吹きセット"
type: "annual_calendar"
trigger: { window: { start: "YYYY-03-01", end: "YYYY-03-31" } }
propose_text: { ja: "春めく話題を少し加えます。参加しますか？" }
on_accept:
  bias_keywords: ["桜前線","卒業/新生活","模様替え","花粉"]
  bias_strength: 0.16

[EVENT:month-04]
id: "month-04"
name: "4月・スタートセット"
type: "annual_calendar"
trigger: { window: { start: "YYYY-04-01", end: "YYYY-04-30" } }
propose_text: { ja: "始まりの季節の小ネタを少し。参加しますか？" }
on_accept:
  bias_keywords: ["新学期/新年度","通勤通学","出会い","リズムづくり"]
  bias_strength: 0.16

[EVENT:month-05]
id: "month-05"
name: "5月・リフレッシュセット"
type: "annual_calendar"
trigger: { window: { start: "YYYY-05-01", end: "YYYY-05-31" } }
propose_text: { ja: "初夏のリフレッシュ話題を少し。参加しますか？" }
on_accept:
  bias_keywords: ["連休明け","散歩","緑","気分転換"]
  bias_strength: 0.16

[EVENT:month-06]
id: "month-06"
name: "6月・雨と整えセット"
type: "annual_calendar"
trigger: { window: { start: "YYYY-06-01", end: "YYYY-06-30" } }
propose_text: { ja: "梅雨の過ごし方を軽く。参加しますか？" }
on_accept:
  bias_keywords: ["雨音","除湿","読書/音楽","家時間"]
  bias_strength: 0.16

[EVENT:month-07]
id: "month-07"
name: "7月・夏支度セット"
type: "annual_calendar"
trigger: { window: { start: "YYYY-07-01", end: "YYYY-07-31" } }
propose_text: { ja: "夏本番前の話題を少し。参加しますか？" }
on_accept:
  bias_keywords: ["涼","花火/祭り","冷たい麺","日差し"]
  bias_strength: 0.16

[EVENT:month-08]
id: "month-08"
name: "8月・真夏セット"
type: "annual_calendar"
trigger: { window: { start: "YYYY-08-01", end: "YYYY-08-31" } }
propose_text: { ja: "真夏らしい話題を少し。参加しますか？" }
on_accept:
  bias_keywords: ["海/山","アイス","夜更かし","帰省"]
  bias_strength: 0.16

[EVENT:month-09]
id: "month-09"
name: "9月・秋口セット"
type: "annual_calendar"
trigger: { window: { start: "YYYY-09-01", end: "YYYY-09-30" } }
propose_text: { ja: "秋の気配を少し。参加しますか？" }
on_accept:
  bias_keywords: ["月","虫の声","読書の秋","衣替え"]
  bias_strength: 0.16

[EVENT:month-10]
id: "month-10"
name: "10月・収穫セット"
type: "annual_calendar"
trigger: { window: { start: "YYYY-10-01", end: "YYYY-10-31" } }
propose_text: { ja: "実りの秋の小ネタを少し。参加しますか？" }
on_accept:
  bias_keywords: ["旬の味覚","散策","ハロウィン（軽）","灯り"]
  bias_strength: 0.16

[EVENT:month-11]
id: "month-11"
name: "11月・深まる秋セット"
type: "annual_calendar"
trigger: { window: { start: "YYYY-11-01", end: "YYYY-11-30" } }
propose_text: { ja: "深まる秋の話題を少し。参加しますか？" }
on_accept:
  bias_keywords: ["紅葉","温泉","こたつ準備","しっとり"]
  bias_strength: 0.16

[EVENT:month-12]
id: "month-12"
name: "12月・年の瀬セット"
type: "annual_calendar"
trigger: { window: { start: "YYYY-12-01", end: "YYYY-12-31" } }
propose_text: { ja: "年の瀬の整えを軽く。参加しますか？" }
on_accept:
  bias_keywords: ["大掃除","ごほうび","振り返り","締めくくり"]
  bias_strength: 0.16

# ─────────────── ニュース（テンプレ） ───────────────
[EVENT:news-lite]
id: "news-lite"
name: "今話題のトピック（軽）"
type: "recent_news"
trigger:
  mode: "manual_or_daily-09:00"   # 手動/毎朝1回
propose_text:
  ja: "最新トピックを1つだけ軽く差し込みます。参加しますか？"
on_accept:
  bias_strength: 0.12
  inject_strategy: "single-headline"
  source_mode: "none"              # デフォルトは外部検索なし（ISOLATED）
  # 外部検索を使う場合はCursor側で module:news_fetcher を有効化して
  # source_mode:"connector" に変更し、connector_id を渡す。
  connector_hint:
    id: "news_fetcher"
    fields: ["title","summary","url"]
guardrails:
  - "政治/宗教/災害は中立・事実のみ、短く触れる"
  - "センシティブは深追いしない"
fallback_when_no_news:
  ja: "最近気になったことはありますか？（軽い雑談に切替）"

[REPORT_HINTS]
kpis:
  - { id: "opt_in_rate", desc: "提案→参加の比率" }
  - { id: "avg_session_len", desc: "イベント参加時の平均ターン" }
  - { id: "complaint_count", desc: "不満/ノイズ報告数" }
notes:
  - "Weekly 7種 & Monthly 12種は固定運用。誤爆を避けるため bias ≤ 0.2 推奨。"
  - "Newsは外部検索なしでも運用可。必要時のみ connector を有効化。"
