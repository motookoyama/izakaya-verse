from langchain_community.document_loaders import PyMuPDFLoader

def load_pdf(pdf_path):
    """
    PDFファイルを読み込み、テキストとして抽出します。
    
    Args:
        pdf_path (str): PDFファイルのパス
        
    Returns:
        list: ドキュメントのリスト
    """
    loader = PyMuPDFLoader(pdf_path)
    documents = loader.load()
    return documents

if __name__ == "__main__":
    # テスト用のPDFファイルパスを指定
    pdf_path = "path/to/your/pdf/file.pdf"
    
    try:
        documents = load_pdf(pdf_path)
        for i, doc in enumerate(documents):
            print(f"\n=== ページ {i+1} ===")
            print(doc.page_content)
    except Exception as e:
        print(f"エラーが発生しました: {str(e)}") 