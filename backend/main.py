import json
import uuid
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from models import ChatRequest, ChatResponse, WebSocketMessage, ConnectionStatus
from services.chatgpt_service import chatgpt_service
from websocket_manager import websocket_manager

# Create FastAPI app
app = FastAPI(
    title="ChatGPT WebSocket API",
    description="Real-time chat application with ChatGPT integration",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    try:
        # Validate OpenAI API key
        is_valid = await chatgpt_service.validate_api_key()
        if not is_valid:
            print("Warning: OpenAI API key validation failed")
        else:
            print("OpenAI API key validated successfully")
    except Exception as e:
        print(f"Error during startup: {e}")

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "ChatGPT WebSocket API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "connections": websocket_manager.get_connection_count()
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    REST API endpoint for chat (non-streaming).
    
    Args:
        request: The chat request
        
    Returns:
        ChatResponse: The complete response from ChatGPT
    """
    try:
        # Process the message
        response_chunks = []
        async for chunk in chatgpt_service.process_message(request.message):
            response_chunks.append(chunk)
        
        # Combine all chunks
        full_response = "".join(response_chunks)
        
        return ChatResponse(
            message=full_response,
            conversation_id=request.conversation_id,
            is_complete=True
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time chat.
    
    Args:
        websocket: The WebSocket connection
    """
    connection_id = None
    conversation_id = None
    
    try:
        # Accept the connection
        connection_id = await websocket_manager.connect(websocket)
        print(f"Client connected: {connection_id}")
        
        # Handle incoming messages
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            
            try:
                # Parse the message
                message_data = json.loads(data)
                message_type = message_data.get("type", "message")
                
                if message_type == "message":
                    # Handle chat message
                    user_message = message_data.get("message", "")
                    conversation_id = message_data.get("conversation_id")
                    
                    if not user_message.strip():
                        continue
                    
                    # Send acknowledgment
                    await websocket_manager.send_personal_message(
                        connection_id,
                        WebSocketMessage(
                            type="status",
                            data={"status": "processing", "message": "Processing your message..."},
                            conversation_id=conversation_id
                        )
                    )
                    
                    # Process with ChatGPT and stream response
                    response_text = ""
                    async for chunk in chatgpt_service.process_message(user_message):
                        response_text += chunk
                        
                        # Send chunk to client
                        await websocket_manager.send_personal_message(
                            connection_id,
                            WebSocketMessage(
                                type="message",
                                data={
                                    "content": chunk,
                                    "is_complete": False,
                                    "timestamp": datetime.now().isoformat()
                                },
                                conversation_id=conversation_id
                            )
                        )
                    
                    # Send completion message
                    await websocket_manager.send_personal_message(
                        connection_id,
                        WebSocketMessage(
                            type="message",
                            data={
                                "content": "",
                                "is_complete": True,
                                "timestamp": datetime.now().isoformat()
                            },
                            conversation_id=conversation_id
                        )
                    )
                
                elif message_type == "ping":
                    # Handle ping for connection keep-alive
                    await websocket_manager.send_personal_message(
                        connection_id,
                        WebSocketMessage(
                            type="pong",
                            data={"timestamp": datetime.now().isoformat()},
                            conversation_id=conversation_id
                        )
                    )
                
            except json.JSONDecodeError:
                # Send error for invalid JSON
                await websocket_manager.send_personal_message(
                    connection_id,
                    WebSocketMessage(
                        type="error",
                        data={"message": "Invalid JSON format"},
                        conversation_id=conversation_id
                    )
                )
            
            except Exception as e:
                # Send error for processing failures
                await websocket_manager.send_personal_message(
                    connection_id,
                    WebSocketMessage(
                        type="error",
                        data={"message": f"Error processing message: {str(e)}"},
                        conversation_id=conversation_id
                    )
                )
    
    except WebSocketDisconnect:
        print(f"Client disconnected: {connection_id}")
    
    except Exception as e:
        print(f"WebSocket error: {e}")
    
    finally:
        # Clean up connection
        if connection_id:
            await websocket_manager.disconnect(connection_id)
            print(f"Cleaned up connection: {connection_id}")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    ) 