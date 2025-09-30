# Webstyle アセット概要

このフォルダは IZAKAYA Verse の UI デザイン案とリファレンス素材をまとめたものです。Vue アプリへ取り込む際のメモ用に内容を分類しました。

## 単体 HTML / CSS スタイル集
- `chat_skin_bright.html`: 明るい配色のチャット UI。CSS 変数 `:root` を調整するだけで全体の色を変更可能。
- `izakaya_chat_ui_palette.html`: 濃色パレット版のチャット UI。スキン構成やレイアウトの基本形を確認するためのベース。
- `izakaya_chat_ui_singl02_sketch.html`, `izakaya_chat_ui_single_file_html_from_napkin_sketch.html`: 初期スケッチをそのまま HTML 化したバリエーション。
- `metacap_v2editor_skinnable.html`: MetaCapture + V2 Editor 想定レイアウト。`data-skin` 属性で `steampunk / pacific / rose` など複数スキンを切り替えられるサンプルが入っています。

## ZIP バンドル
- `izakaya_bright_chat_bundle.zip`: 上記 `chat_skin_bright.html` と README をセットにしたもの。
- `IZAKAYA Verse Chatbot Site*.zip`: React + Tailwind + Radix ベースのプロトタイプ（計 4 種）。`src/App.tsx` と `src/components/…` に多機能 UI が実装されており、Vue へ移植する際の参考になります。
  - `temp_web_content/skins/site1` に展開済み（他の番号付き ZIP も同様に展開可能）。
- `IZAKAYA ruff sketch.png`, `UIUX設計1.jpg`, `ui-design-smartphone-elements-…`, `user-interface-elements-set-…`: レイアウトの参考画像やコンポーネント例。
- `ui-design-smartphone… .avif`: スマホ向け UI パーツの参照画像。

## 利用メモ
- スキン切り替え: `metacap_v2editor_skinnable.html` の CSS 変数と `data-skin` 制御ロジックが流用できます。
- 多言語対応: React プロトタイプ内に英語 UI 文言が多数あるため、これを翻訳辞書に落とし込み Vue i18n へ組み込む予定です。
- 管理パネル: React プロトタイプ (`components/character-card`, `multiplayer-chat` など) にダッシュボード要素がまとまっているので、Vue 版ではサイドバーやタブに再配置します。

Vue プロジェクトへインポートする前に、必要なデザイン案を選別した上で `apps/web/src/design/` などへコピーする予定です。
