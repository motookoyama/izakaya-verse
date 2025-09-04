import os
import time
import argparse
from pathlib import Path
from langchain_community.document_loaders import PyMuPDFLoader
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class PDFHandler(FileSystemEventHandler):
    def __init__(self, input_dir, output_dir=None):
        self.input_dir = input_dir
        self.output_dir = output_dir
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
    
    def process_pdf(self, pdf_path):
        try:
            print(f"PDFファイルを読み込み中: {pdf_path}")
            loader = PyMuPDFLoader(pdf_path)
            documents = loader.load()
            
            # テキストを表示
            for i, doc in enumerate(documents):
                print(f"\n=== ページ {i+1} ===")
                print(doc.page_content)
                print("\n")
            
        except Exception as e:
            print(f"エラーが発生しました: {str(e)}")

def main():
    # コマンドライン引数の設定
    parser = argparse.ArgumentParser(description='PDFファイルをテキストとして読み込みます')
    parser.add_argument('--folder', '-f', 
                      help='処理するPDFファイルが含まれるフォルダのパス')
    args = parser.parse_args()
    
    if not args.folder:
        print("エラー: フォルダパスを指定してください")
        print("使用例: python pdf_folder_processor.py --folder '/path/to/folder'")
        return
    
    # パスの正規化
    folder_path = os.path.normpath(args.folder)
    
    # フォルダの存在確認
    if not os.path.exists(folder_path):
        print(f"エラー: 指定されたフォルダが存在しません: {folder_path}")
        print("フォルダ名に全角スペースが含まれている場合は、正確に指定してください")
        return
    
    print(f"指定されたフォルダ: {folder_path}")
    print("フォルダ内のファイル一覧:")
    for file in os.listdir(folder_path):
        print(f"- {file}")
    
    print("\nPDFファイルを処理中...")
    
    # PDFファイルを処理
    handler = PDFHandler(folder_path)
    for file in os.listdir(folder_path):
        if file.lower().endswith('.pdf'):
            pdf_path = os.path.join(folder_path, file)
            handler.process_pdf(pdf_path)

if __name__ == "__main__":
    main() 