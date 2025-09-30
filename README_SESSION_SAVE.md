セッションメモの素早い保存方法

目的:
  ワークスペースやコンテナが再起動されても会話や作業メモを保持するため、重要な内容を素早くファイルへ保存する手順を用意しました。

使い方:
  1) 単純なメモを保存:
     echo "重要なメモ" | python tools/save_session.py "短いタイトル"

  2) 長い会話をファイルから読み込んで保存:
     python tools/save_session.py "議事録" < transcript.txt

  3) クリップボードから直接保存 (xclip/xselが必要):
     xclip -o | python tools/save_session.py "クリップ"

ファイル:
  - `tools/save_session.py`: メモを`SESSION_NOTES.md`へ追記するスクリプト
  - `SESSION_NOTES.md`: 既に存在する場合は追記され、なければ新規作成されます。

注意事項:
  - このスクリプトはローカルにメモを残すための簡易ツールです。チャット履歴を自動で収集するものではありません。
  - 必要ならエディタ統合（VSCodeタスクやコマンドパレット）や、より高度な同期ツールの導入をサポートします。
