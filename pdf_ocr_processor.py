#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OCRを使用して日本語PDFから入出金情報を抽出し、月別集計を行うスクリプト
"""

import os
import re
import pandas as pd
from datetime import datetime
import pytesseract
from pdf2image import convert_from_path
from pathlib import Path
import cv2
import numpy as np

class PDFOCRProcessor:
    def __init__(self, pdf_directory):
        self.pdf_directory = Path(pdf_directory)
        self.transactions = []
        
        # tesseractの設定
        pytesseract.pytesseract.tesseract_cmd = '/usr/local/bin/tesseract'
        
    def extract_text_from_pdf_ocr(self, pdf_path):
        """PDFを画像に変換してOCRでテキストを抽出"""
        try:
            # PDFを画像に変換
            print(f"  PDFを画像に変換中...")
            images = convert_from_path(pdf_path, dpi=300)
            
            all_text = ""
            for i, image in enumerate(images):
                print(f"  ページ {i+1}/{len(images)} を処理中...")
                
                # 画像をOpenCV形式に変換
                opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
                
                # 画像の前処理（コントラスト向上）
                gray = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)
                enhanced = cv2.equalizeHist(gray)
                
                # OCR実行（日本語 + 英語）
                text = pytesseract.image_to_string(enhanced, lang='jpn+eng', config='--psm 6')
                all_text += text + "\n"
                
                # デバッグ用：最初のページの最初の数行を表示
                if i == 0:
                    print(f"    抽出されたテキスト（最初の10行）:")
                    for j, line in enumerate(text.split('\n')[:10]):
                        if line.strip():
                            print(f"      {j+1}: {line.strip()}")
            
            return all_text
            
        except Exception as e:
            print(f"  OCR処理エラー: {e}")
            return ""
    
    def save_ocr_text_to_file(self, text, pdf_filename, output_dir="bank_statement_results"):
        """OCR抽出テキストをファイルに保存"""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        # ファイル名を整形（拡張子を除く）
        base_name = pdf_filename.replace('.pdf', '')
        
        # OCR抽出テキストを保存
        ocr_file = output_path / f"ocr_raw_{base_name}.txt"
        with open(ocr_file, 'w', encoding='utf-8') as f:
            f.write(f"=== OCR抽出テキスト: {pdf_filename} ===\n")
            f.write(f"抽出日時: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("=" * 50 + "\n\n")
            f.write(text)
        
        print(f"    OCR抽出テキストを保存: {ocr_file}")
        
        # 手動編集用のテンプレートファイルも作成
        template_file = output_path / f"manual_edit_{base_name}.txt"
        with open(template_file, 'w', encoding='utf-8') as f:
            f.write(f"=== 手動編集用テンプレート: {pdf_filename} ===\n")
            f.write("以下の形式で取引明細を入力してください:\n")
            f.write("形式: YYYY/MM/DD 金額 取引内容\n")
            f.write("例: 2025/03/15 50000 給与振込\n")
            f.write("例: 2025/03/20 -15000 ATM出金\n")
            f.write("=" * 50 + "\n\n")
            f.write("# ここに取引明細を入力してください\n")
            f.write("# 1行1取引で、日付 金額 内容の順で入力\n")
            f.write("# 出金は負の金額（例: -1000）で入力\n")
            f.write("# 入金は正の金額（例: 1000）で入力\n\n")
        
        print(f"    手動編集テンプレートを作成: {template_file}")
        
        return ocr_file, template_file
    
    def parse_transactions(self, text, filename):
        """テキストから取引情報を解析（日本語対応）"""
        # 日付パターン（日本語形式に対応）
        date_patterns = [
            r'(\d{4})[/\-年](\d{1,2})[/\-月](\d{1,2})[日]?',  # 2024年1月15日, 2024/01/15
            r'(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})',         # 15/01/2024
            r'(\d{4})(\d{2})(\d{2})',                       # 20240115
        ]
        
        # 金額パターン（日本語形式に対応）
        amount_patterns = [
            r'([0-9,]+\.?\d*)[円]?',  # 1,000円 または 1,000.00
            r'([0-9,]+)',             # 1,000
        ]
        
        lines = text.split('\n')
        transactions = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # 日付を探す
            date_match = None
            for pattern in date_patterns:
                date_match = re.search(pattern, line)
                if date_match:
                    break
            
            if date_match:
                # 金額を探す
                amount_match = None
                for amount_pattern in amount_patterns:
                    amounts = re.findall(amount_pattern, line)
                    # 最後の金額を取引金額として扱う
                    if amounts:
                        amount_match = amounts[-1]
                        break
                
                if amount_match:
                    try:
                        # 日付を正規化
                        if len(date_match.groups()) == 3:
                            if len(date_match.group(1)) == 4:  # YYYY/MM/DD
                                year, month, day = date_match.groups()
                            else:  # DD/MM/YYYY
                                day, month, year = date_match.groups()
                        else:
                            continue
                        
                        # 日付の妥当性チェック
                        year = int(year)
                        month = int(month)
                        day = int(day)
                        
                        if not (1900 <= year <= 2100 and 1 <= month <= 12 and 1 <= day <= 31):
                            print(f"    無効な日付をスキップ: {year}-{month}-{day} (行: {line[:50]}...)")
                            continue
                        
                        # 金額を正規化
                        amount_str = amount_match.replace(',', '')
                        amount = float(amount_str)
                        
                        # 取引種別を判定（入金/出金）
                        # 日本語のキーワードで判定
                        if any(keyword in line for keyword in ['入金', '振込', '受取', '収入', '給与', '給料']):
                            transaction_type = "入金"
                        elif any(keyword in line for keyword in ['出金', '支払', '引き落とし', '手数料', 'ATM', '現金']):
                            transaction_type = "出金"
                        else:
                            # 金額の符号で判定
                            transaction_type = "入金" if amount > 0 else "出金"
                        
                        transaction = {
                            'date': f"{year:04d}-{month:02d}-{day:02d}",
                            'amount': abs(amount),
                            'type': transaction_type,
                            'description': line[:100],  # 最初の100文字を説明として使用
                            'source_file': filename
                        }
                        transactions.append(transaction)
                        print(f"    取引を抽出: {transaction['date']} {transaction['type']} {transaction['amount']:,.0f}円")
                        
                    except (ValueError, IndexError) as e:
                        print(f"    取引解析エラー: {line} - {e}")
                        continue
        
        return transactions
    
    def process_all_pdfs(self):
        """すべてのPDFファイルを処理"""
        pdf_files = list(self.pdf_directory.glob("*.pdf"))
        
        if not pdf_files:
            print(f"PDFファイルが見つかりません: {self.pdf_directory}")
            return
        
        print(f"処理対象PDFファイル数: {len(pdf_files)}")
        
        # 結果保存用ディレクトリ
        output_dir = "bank_statement_results"
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        # 処理結果サマリー
        summary = []
        summary.append("=== OCR処理結果サマリー ===")
        summary.append(f"処理日時: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        summary.append(f"処理対象ファイル数: {len(pdf_files)}")
        summary.append("")
        
        for pdf_file in pdf_files:
            print(f"\n処理中: {pdf_file.name}")
            summary.append(f"--- {pdf_file.name} ---")
            
            try:
                text = self.extract_text_from_pdf_ocr(pdf_file)
                if text:
                    # OCR抽出テキストをファイルに保存
                    ocr_file, template_file = self.save_ocr_text_to_file(text, pdf_file.name, output_dir)
                    
                    # 自動解析を試行
                    transactions = self.parse_transactions(text, pdf_file.name)
                    self.transactions.extend(transactions)
                    
                    summary.append(f"  OCR抽出テキスト: {ocr_file}")
                    summary.append(f"  手動編集テンプレート: {template_file}")
                    summary.append(f"  自動抽出取引数: {len(transactions)}")
                    
                    if len(transactions) == 0:
                        summary.append("  → 自動抽出できませんでした。手動編集テンプレートを使用してください。")
                    
                    print(f"  抽出された取引数: {len(transactions)}")
                else:
                    summary.append(f"  テキスト抽出失敗")
                    print(f"  テキスト抽出失敗: {pdf_file.name}")
                    
            except Exception as e:
                summary.append(f"  処理エラー: {e}")
                print(f"  処理エラー: {pdf_file.name} - {e}")
        
        # サマリーファイルを保存
        summary_file = output_path / "ocr_processing_summary.txt"
        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(summary))
        
        print(f"\n処理サマリーを保存: {summary_file}")
    
    def create_monthly_summary(self):
        """月別集計を作成"""
        if not self.transactions:
            print("取引データがありません")
            return None
        
        df = pd.DataFrame(self.transactions)
        
        # 日付の妥当性を再チェック
        print("抽出された取引データ:")
        for i, row in df.iterrows():
            print(f"  {i+1}: {row['date']} {row['type']} {row['amount']:,.0f}円")
        
        try:
            df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d')
            df['year_month'] = df['date'].dt.to_period('M')
            
            # 月別集計
            monthly_summary = df.groupby(['year_month', 'type']).agg({
                'amount': ['sum', 'count']
            }).round(2)
            
            # 列名を整理
            monthly_summary.columns = ['合計金額', '取引回数']
            monthly_summary = monthly_summary.reset_index()
            
            return monthly_summary
            
        except Exception as e:
            print(f"月別集計作成エラー: {e}")
            return None
    
    def save_results(self, output_dir="bank_statement_results"):
        """結果を保存"""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        if self.transactions:
            # 全取引データをCSVに保存
            df_all = pd.DataFrame(self.transactions)
            df_all.to_csv(output_path / "all_transactions.csv", index=False, encoding='utf-8-sig')
            
            # 月別集計をCSVに保存
            monthly_summary = self.create_monthly_summary()
            if monthly_summary is not None:
                monthly_summary.to_csv(output_path / "monthly_summary.csv", index=False, encoding='utf-8-sig')
            
            # サマリーレポートを作成
            self.create_summary_report(output_path)
        
        # 手動編集用のREADMEファイルを作成
        readme_file = output_path / "README_manual_edit.md"
        with open(readme_file, 'w', encoding='utf-8') as f:
            f.write("# 手動編集ガイド\n\n")
            f.write("## 手順\n\n")
            f.write("1. `ocr_raw_*.txt` ファイルを開き、取引明細部分を確認\n")
            f.write("2. `manual_edit_*.txt` ファイルに取引明細を手動で入力\n")
            f.write("3. 入力形式: `YYYY/MM/DD 金額 取引内容`\n")
            f.write("   - 例: `2025/03/15 50000 給与振込`\n")
            f.write("   - 例: `2025/03/20 -15000 ATM出金`\n")
            f.write("4. 手動編集完了後、`process_manual_files.py` を実行\n\n")
            f.write("## 注意事項\n\n")
            f.write("- 出金は負の金額（例: -1000）で入力\n")
            f.write("- 入金は正の金額（例: 1000）で入力\n")
            f.write("- 1行1取引で入力\n")
            f.write("- 日付は YYYY/MM/DD 形式で統一\n")
        
        print(f"\n結果を保存しました: {output_path}")
        print(f"手動編集ガイド: {readme_file}")
    
    def create_summary_report(self, output_path):
        """サマリーレポートを作成"""
        df = pd.DataFrame(self.transactions)
        
        try:
            df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d')
        except Exception as e:
            print(f"日付変換エラー: {e}")
            return
        
        report = []
        report.append("=== 銀行口座取引サマリーレポート（OCR処理） ===")
        report.append(f"処理日時: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append(f"処理対象ファイル数: {len(set(df['source_file']))}")
        report.append(f"総取引数: {len(df)}")
        report.append(f"期間: {df['date'].min().strftime('%Y-%m-%d')} ～ {df['date'].max().strftime('%Y-%m-%d')}")
        report.append("")
        
        # 入出金別集計
        type_summary = df.groupby('type').agg({
            'amount': ['sum', 'count']
        }).round(2)
        report.append("=== 入出金別集計 ===")
        for trans_type in type_summary.index:
            total = type_summary.loc[trans_type, ('amount', 'sum')]
            count = type_summary.loc[trans_type, ('amount', 'count')]
            report.append(f"{trans_type}: {total:,.0f}円 ({count}回)")
        
        report.append("")
        
        # 月別集計
        monthly_summary = self.create_monthly_summary()
        if monthly_summary is not None:
            report.append("=== 月別集計 ===")
            for _, row in monthly_summary.iterrows():
                year_month = row['year_month']
                trans_type = row['type']
                total = row['合計金額']
                count = row['取引回数']
                report.append(f"{year_month} {trans_type}: {total:,.0f}円 ({count}回)")
        
        # レポートを保存
        with open(output_path / "summary_report.txt", 'w', encoding='utf-8') as f:
            f.write('\n'.join(report))
        
        # レポートを表示
        print('\n'.join(report))

def main():
    # 管理フォルダのパスを指定
    pdf_directory = "/Volumes/Mac2TB/cursor_main/documents/management"
    
    print("OCRを使用した銀行口座PDF処理を開始します...")
    
    # プロセッサーを作成
    processor = PDFOCRProcessor(pdf_directory)
    
    # すべてのPDFを処理
    processor.process_all_pdfs()
    
    # 結果を保存
    processor.save_results()
    
    print("\n処理が完了しました。")
    print("\n次のステップ:")
    print("1. bank_statement_results/ フォルダ内の ocr_raw_*.txt ファイルを確認")
    print("2. manual_edit_*.txt ファイルに取引明細を手動で入力")
    print("3. 手動編集完了後、process_manual_files.py を実行して集計")

if __name__ == "__main__":
    main() 