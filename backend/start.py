#!/usr/bin/env python3
"""
Startup script for the ChatGPT WebSocket Chat Backend
"""

import uvicorn
from config import settings

if __name__ == "__main__":
    print("🤖 Starting ChatGPT WebSocket Chat Backend...")
    print(f"📍 Server will be available at: http://{settings.HOST}:{settings.PORT}")
    print(f"🔌 WebSocket endpoint: ws://{settings.HOST}:{settings.PORT}/ws/chat")
    print(f"📚 API documentation: http://{settings.HOST}:{settings.PORT}/docs")
    print("=" * 50)
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
        log_level="info"
    ) 