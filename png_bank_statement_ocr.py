#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PNG画像から銀行明細をOCR抽出し、月別入金集計を行うスクリプト
"""

import os
import re
import pandas as pd
from datetime import datetime
from pathlib import Path
import pytesseract
import cv2
import numpy as np

class PNGStatementOCR:
    def __init__(self, image_directory):
        self.image_directory = Path(image_directory)
        self.transactions = []
        pytesseract.pytesseract.tesseract_cmd = '/usr/local/bin/tesseract'

    def extract_text_from_image(self, image_path):
        print(f"  画像OCR処理中: {image_path.name}")
        image = cv2.imread(str(image_path))
        if image is None:
            print(f"  画像読み込み失敗: {image_path}")
            return ""
        # グレースケール変換
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        # 二値化
        _, thresh = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY)
        # OCR実行
        text = pytesseract.image_to_string(thresh, lang='jpn+eng', config='--psm 6')
        return text

    def parse_transactions(self, text, filename):
        transactions = []
        # 1行ごとに分割
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
            # 日付・金額・内容のパターンを抽出
            # 例: 2025.05.02 25,000 円 32,591 円 | 振込 サトウヨシエ
            m = re.match(r'(20\d{2}[./-]\d{2}[./-]\d{2})\s+([\d,]+)\s*円.*?\|\s*(.+)', line)
            if m:
                date_str, amount_str, description = m.groups()
                # オオイタシの補助金振込は除外
                if 'オオイタシ' in description:
                    continue
                # 金額を正規化
                amount = int(amount_str.replace(',', ''))
                # 入金のみ集計
                if amount > 0:
                    transactions.append({
                        'date': date_str.replace('.', '-').replace('/', '-'),
                        'amount': amount,
                        'description': description,
                        'source_file': filename
                    })
        return transactions

    def process_all_images(self):
        png_files = list(self.image_directory.glob('*.png'))
        if not png_files:
            print(f"PNGファイルが見つかりません: {self.image_directory}")
            return
        print(f"処理対象PNGファイル数: {len(png_files)}")
        for png_file in png_files:
            text = self.extract_text_from_image(png_file)
            transactions = self.parse_transactions(text, png_file.name)
            self.transactions.extend(transactions)
            print(f"  {png_file.name} から抽出された入金件数: {len(transactions)}")

    def create_monthly_summary(self):
        if not self.transactions:
            print("入金データがありません")
            return None
        df = pd.DataFrame(self.transactions)
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df = df.dropna(subset=['date'])
        df['year_month'] = df['date'].dt.to_period('M')
        monthly_summary = df.groupby('year_month').agg({'amount': ['sum', 'count']}).reset_index()
        monthly_summary.columns = ['年月', '合計入金額', '入金件数']
        print("\n月別入金集計:")
        print(monthly_summary)
        monthly_summary.to_csv('bank_statement_results/png_monthly_income_summary.csv', index=False, encoding='utf-8-sig')
        return monthly_summary

def main():
    image_dir = 'documents/management'
    ocr = PNGStatementOCR(image_dir)
    ocr.process_all_images()
    ocr.create_monthly_summary()
    print("\nPNG画像からの入金集計が完了しました。結果は bank_statement_results/png_monthly_income_summary.csv に保存されています。")

if __name__ == '__main__':
    main() 