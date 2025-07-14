import pytest
from datetime import datetime
from pydantic import ValidationError
from models import (
    ChatRequest, 
    ChatResponse, 
    WebSocketMessage, 
    ConnectionStatus,
    ChatMessage,
    MessageRole
)

class TestChatRequest:
    """Test cases for ChatRequest model."""
    
    def test_valid_request(self):
        """Test valid chat request."""
        request = ChatRequest(message="Hello, world!")
        assert request.message == "Hello, world!"
        assert request.conversation_id is None
    
    def test_valid_request_with_conversation_id(self):
        """Test valid chat request with conversation ID."""
        request = ChatRequest(
            message="Hello, world!",
            conversation_id="conv-123"
        )
        assert request.message == "Hello, world!"
        assert request.conversation_id == "conv-123"
    
    def test_empty_message_raises_error(self):
        """Test that empty message raises validation error."""
        with pytest.raises(ValidationError):
            ChatRequest(message="")
    
    def test_message_too_long_raises_error(self):
        """Test that message too long raises validation error."""
        long_message = "a" * 1001  # Exceeds max_length of 1000
        with pytest.raises(ValidationError):
            ChatRequest(message=long_message)
    
    def test_missing_message_raises_error(self):
        """Test that missing message raises validation error."""
        with pytest.raises(ValidationError):
            ChatRequest()

class TestChatResponse:
    """Test cases for ChatResponse model."""
    
    def test_valid_response(self):
        """Test valid chat response."""
        response = ChatResponse(message="Hello, world!")
        assert response.message == "Hello, world!"
        assert response.conversation_id is None
        assert response.is_complete is False
        assert response.error is None
    
    def test_complete_response(self):
        """Test complete chat response."""
        response = ChatResponse(
            message="Hello, world!",
            conversation_id="conv-123",
            is_complete=True
        )
        assert response.message == "Hello, world!"
        assert response.conversation_id == "conv-123"
        assert response.is_complete is True
    
    def test_error_response(self):
        """Test error response."""
        response = ChatResponse(
            message="",
            error="API Error occurred"
        )
        assert response.message == ""
        assert response.error == "API Error occurred"
        assert response.is_complete is False

class TestWebSocketMessage:
    """Test cases for WebSocketMessage model."""
    
    def test_valid_message(self):
        """Test valid WebSocket message."""
        message = WebSocketMessage(
            type="message",
            data={"content": "Hello", "timestamp": "2023-01-01T00:00:00"}
        )
        assert message.type == "message"
        assert message.data["content"] == "Hello"
        assert message.conversation_id is None
    
    def test_message_with_conversation_id(self):
        """Test WebSocket message with conversation ID."""
        message = WebSocketMessage(
            type="status",
            data={"status": "connected"},
            conversation_id="conv-123"
        )
        assert message.type == "status"
        assert message.data["status"] == "connected"
        assert message.conversation_id == "conv-123"

class TestConnectionStatus:
    """Test cases for ConnectionStatus model."""
    
    def test_valid_status(self):
        """Test valid connection status."""
        status = ConnectionStatus(status="connected")
        assert status.status == "connected"
        assert status.message is None
    
    def test_status_with_message(self):
        """Test connection status with message."""
        status = ConnectionStatus(
            status="error",
            message="Connection failed"
        )
        assert status.status == "error"
        assert status.message == "Connection failed"

class TestChatMessage:
    """Test cases for ChatMessage model."""
    
    def test_valid_user_message(self):
        """Test valid user message."""
        message = ChatMessage(
            role=MessageRole.USER,
            content="Hello, AI!"
        )
        assert message.role == MessageRole.USER
        assert message.content == "Hello, AI!"
        assert message.timestamp is None
    
    def test_valid_assistant_message(self):
        """Test valid assistant message."""
        message = ChatMessage(
            role=MessageRole.ASSISTANT,
            content="Hello, human!",
            timestamp="2023-01-01T00:00:00"
        )
        assert message.role == MessageRole.ASSISTANT
        assert message.content == "Hello, human!"
        assert message.timestamp == "2023-01-01T00:00:00"
    
    def test_system_message(self):
        """Test system message."""
        message = ChatMessage(
            role=MessageRole.SYSTEM,
            content="You are a helpful assistant."
        )
        assert message.role == MessageRole.SYSTEM
        assert message.content == "You are a helpful assistant."

class TestMessageRole:
    """Test cases for MessageRole enum."""
    
    def test_enum_values(self):
        """Test that enum has correct values."""
        assert MessageRole.USER == "user"
        assert MessageRole.ASSISTANT == "assistant"
        assert MessageRole.SYSTEM == "system"
    
    def test_enum_membership(self):
        """Test enum membership."""
        assert "user" in MessageRole
        assert "assistant" in MessageRole
        assert "system" in MessageRole
        assert "invalid" not in MessageRole 