# Frame Mapping Notes

このディレクトリはページごとのフレームマッピング（フェーズ1: レイアウト固定）の参照用です。各 HTML はモノクロの箱とラベルのみで構成し、CSS の `content` にタグ (#...) を埋め込んでブロックの役割を示しています。

| Page | File | Key Blocks (タグ) |
| --- | --- | --- |
| Home | `home-wireframe.html` | `#シンボル/挨拶`, `#パネルリンク`, `#スタートCTA`, `#VSNS`, `#インフォ` |
| Chat | `chat-wireframe.html` | `#3スロットカード`, `#インフォ`, `#操作パネル`, `#メインチャットフレーム` |
| Library | `library-wireframe.html` | `#フィルタ/検索バー`, `#カード`, `#ページネーション` |
| Info / Help | `info-help-wireframe.html` | `#QR/リンク`, `#詳細テキスト`, `#タイムライン`, `#記事`, `#補足` |
| MetaCapture Editor | `metacapture-wireframe.html` | `#メタキャプチャーフロー`, `#V2カード情報`, `#キャラプロンプト/エディタ` |
| Default Template | `template-wireframe.html` | `#ヒーロー`, `#メインCTA`, `#テキストセクション`, `#ボタン`, `#フッター/補足` |

## 流れ
1. **Frame (現状)**: レイアウトの形を固定。タグが示す枠を変えずに後続フェーズへ進む。
2. **Style**: 同じ HTML を元に配色・角丸・余白を適用。
3. **Content**: ブロック内の文言・メディアを流し込み。
4. **Integration**: API やコンポーネントを接続し、挙動を付与。

> AI セッションが変わっても本マップを参照することで、レイアウトの合意済み状態を復元できます。
