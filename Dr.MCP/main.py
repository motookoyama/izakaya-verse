from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from pathlib import Path

app = FastAPI(title="Dr.MCP Server")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 設定ファイルの読み込み
def load_settings():
    settings_path = Path(__file__).parent / "settings.json"
    try:
        with open(settings_path, "r") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"設定ファイルの読み込みに失敗しました: {str(e)}")

settings = load_settings()

@app.get("/")
async def root():
    return {"message": "Dr.MCP Server is running", "status": "active"}

@app.get("/settings")
async def get_settings():
    return settings

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings["server"]["host"], port=settings["server"]["port"]) 