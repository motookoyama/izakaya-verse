#!/usr/bin/env python3
"""
save_session.py

標準入力から受け取ったテキストを `SESSION_NOTES.md` にタイムスタンプ付きで追記する小さなヘルパー。

使い方例:
  echo "今日の重要な会話メモ" | python tools/save_session.py "会議メモ"
  python tools/save_session.py "タイトル" < clipboard.txt
  python tools/save_session.py    # 直接入力（Ctrl-Dで終了）

注意: 自動でチャットコンテンツを取得する機能はありません。必要な部分をコピーしてスクリプトへ流し込みます。
"""
import sys
import datetime
import os

def main():
    title = sys.argv[1] if len(sys.argv) > 1 else ""
    try:
        text = sys.stdin.read()
    except Exception as e:
        print(f"標準入力の読み取りに失敗しました: {e}")
        return 2

    if not text or text.strip() == "":
        print("標準入力からテキストを受け取れませんでした。以下のように使います:\n  echo \"メモ\" | python tools/save_session.py \"タイトル\"")
        return 1

    path = os.path.join(os.getcwd(), "SESSION_NOTES.md")
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    header = f"\n\n## {ts}{' — ' + title if title else ''}\n\n"

    try:
        with open(path, "a", encoding="utf-8") as f:
            f.write(header)
            f.write(text.rstrip() + "\n")
        print(f"追記しました: {path}")
        return 0
    except Exception as e:
        print(f"ファイルへの書き込みに失敗しました: {e}")
        return 3

if __name__ == '__main__':
    sys.exit(main())
