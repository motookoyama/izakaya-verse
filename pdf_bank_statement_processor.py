#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
銀行口座PDFから入出金情報を抽出し、月別集計を行うスクリプト
"""

import os
import re
import pandas as pd
from datetime import datetime
import PyPDF2
import pdfplumber
from pathlib import Path

class BankStatementProcessor:
    def __init__(self, pdf_directory):
        self.pdf_directory = Path(pdf_directory)
        self.transactions = []
        
    def extract_text_from_pdf(self, pdf_path):
        """PDFからテキストを抽出（複数の方法を試行）"""
        text = ""
        
        # 方法1: PyPDF2を使用
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            if text.strip():
                return text
        except Exception as e:
            print(f"PyPDF2でエラー: {e}")
        
        # 方法2: pdfplumberを使用
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            if text.strip():
                return text
        except Exception as e:
            print(f"pdfplumberでエラー: {e}")
        
        return text
    
    def parse_transactions(self, text, filename):
        """テキストから取引情報を解析"""
        # 日付パターン（複数の形式に対応）
        date_patterns = [
            r'(\d{4})[/\-年](\d{1,2})[/\-月](\d{1,2})',  # 2024/01/15, 2024年1月15日
            r'(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})',     # 15/01/2024
            r'(\d{4})(\d{2})(\d{2})',                   # 20240115
        ]
        
        # 金額パターン
        amount_patterns = [
            r'([0-9,]+\.?\d*)',  # 1,000.00 または 1000
            r'([0-9,]+)',        # 1,000
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
                            print(f"無効な日付をスキップ: {year}-{month}-{day} (行: {line[:50]}...)")
                            continue
                        
                        # 金額を正規化
                        amount_str = amount_match.replace(',', '')
                        amount = float(amount_str)
                        
                        # 取引種別を判定（入金/出金）
                        transaction_type = "入金" if amount > 0 else "出金"
                        
                        transaction = {
                            'date': f"{year:04d}-{month:02d}-{day:02d}",
                            'amount': abs(amount),
                            'type': transaction_type,
                            'description': line[:100],  # 最初の100文字を説明として使用
                            'source_file': filename
                        }
                        transactions.append(transaction)
                        print(f"  取引を抽出: {transaction['date']} {transaction['type']} {transaction['amount']:,.0f}円")
                        
                    except (ValueError, IndexError) as e:
                        print(f"取引解析エラー: {line} - {e}")
                        continue
        
        return transactions
    
    def process_all_pdfs(self):
        """すべてのPDFファイルを処理"""
        pdf_files = list(self.pdf_directory.glob("*.pdf"))
        
        if not pdf_files:
            print(f"PDFファイルが見つかりません: {self.pdf_directory}")
            return
        
        print(f"処理対象PDFファイル数: {len(pdf_files)}")
        
        for pdf_file in pdf_files:
            print(f"\n処理中: {pdf_file.name}")
            
            try:
                text = self.extract_text_from_pdf(pdf_file)
                if text:
                    # デバッグ用：最初の数行を表示
                    print(f"  抽出されたテキスト（最初の5行）:")
                    for i, line in enumerate(text.split('\n')[:5]):
                        if line.strip():
                            print(f"    {i+1}: {line.strip()}")
                    
                    transactions = self.parse_transactions(text, pdf_file.name)
                    self.transactions.extend(transactions)
                    print(f"  抽出された取引数: {len(transactions)}")
                else:
                    print(f"  テキスト抽出失敗: {pdf_file.name}")
                    
            except Exception as e:
                print(f"  処理エラー: {pdf_file.name} - {e}")
    
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
        if not self.transactions:
            print("保存するデータがありません")
            return
        
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        # 全取引データをCSVに保存
        df_all = pd.DataFrame(self.transactions)
        df_all.to_csv(output_path / "all_transactions.csv", index=False, encoding='utf-8-sig')
        
        # 月別集計をCSVに保存
        monthly_summary = self.create_monthly_summary()
        if monthly_summary is not None:
            monthly_summary.to_csv(output_path / "monthly_summary.csv", index=False, encoding='utf-8-sig')
        
        # サマリーレポートを作成
        self.create_summary_report(output_path)
        
        print(f"\n結果を保存しました: {output_path}")
    
    def create_summary_report(self, output_path):
        """サマリーレポートを作成"""
        df = pd.DataFrame(self.transactions)
        
        try:
            df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d')
        except Exception as e:
            print(f"日付変換エラー: {e}")
            return
        
        report = []
        report.append("=== 銀行口座取引サマリーレポート ===")
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
    
    print("銀行口座PDF処理を開始します...")
    
    # プロセッサーを作成
    processor = BankStatementProcessor(pdf_directory)
    
    # すべてのPDFを処理
    processor.process_all_pdfs()
    
    # 結果を保存
    processor.save_results()
    
    print("\n処理が完了しました。")

if __name__ == "__main__":
    main() 