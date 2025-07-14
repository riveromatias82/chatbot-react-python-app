from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class MessageRole(str, Enum):
    """Enum for message roles in chat."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class ChatMessage(BaseModel):
    """Model for chat messages."""
    role: MessageRole
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    """Model for chat request from client."""
    message: str = Field(..., min_length=1, max_length=1000)
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    """Model for chat response to client."""
    message: str
    conversation_id: Optional[str] = None
    is_complete: bool = False
    error: Optional[str] = None

class WebSocketMessage(BaseModel):
    """Model for WebSocket messages."""
    type: str  # "message", "error", "status"
    data: dict
    conversation_id: Optional[str] = None

class ConnectionStatus(BaseModel):
    """Model for connection status."""
    status: str  # "connected", "disconnected", "error"
    message: Optional[str] = None 