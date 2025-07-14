import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from services.chatgpt_service import ChatGPTService
from models import ChatMessage, MessageRole

class TestChatGPTService:
    """Test cases for ChatGPTService."""
    
    @pytest.fixture
    def mock_openai_client(self):
        """Mock OpenAI client for testing."""
        with patch('services.chatgpt_service.AsyncOpenAI') as mock_client:
            mock_instance = AsyncMock()
            mock_client.return_value = mock_instance
            yield mock_instance
    
    @pytest.fixture
    def service(self, mock_openai_client):
        """Create a ChatGPTService instance with mocked dependencies."""
        with patch('services.chatgpt_service.settings') as mock_settings:
            mock_settings.OPENAI_API_KEY = "test_api_key"
            mock_settings.OPENAI_MODEL = "gpt-3.5-turbo"
            return ChatGPTService()
    
    @pytest.mark.asyncio
    async def test_init_with_valid_api_key(self):
        """Test service initialization with valid API key."""
        with patch('services.chatgpt_service.settings') as mock_settings, \
             patch('services.chatgpt_service.AsyncOpenAI') as mock_openai:
            mock_settings.OPENAI_API_KEY = "test_api_key"
            mock_settings.OPENAI_MODEL = "gpt-3.5-turbo"
            service = ChatGPTService()
            assert service.model == "gpt-3.5-turbo"
            mock_openai.assert_called_once_with(api_key="test_api_key")
    
    @pytest.mark.asyncio
    async def test_init_without_api_key(self):
        """Test service initialization without API key raises error."""
        with patch('services.chatgpt_service.settings') as mock_settings:
            mock_settings.OPENAI_API_KEY = ""
            
            with pytest.raises(ValueError, match="OPENAI_API_KEY is not set"):
                ChatGPTService()
    
    @pytest.mark.asyncio
    async def test_process_message_success(self, service, mock_openai_client):
        """Test successful message processing."""
        # Mock the streaming response
        mock_chunk1 = MagicMock()
        mock_chunk1.choices = [MagicMock()]
        mock_chunk1.choices[0].delta.content = "Hello"
        
        mock_chunk2 = MagicMock()
        mock_chunk2.choices = [MagicMock()]
        mock_chunk2.choices[0].delta.content = " world"
        
        mock_chunk3 = MagicMock()
        mock_chunk3.choices = [MagicMock()]
        mock_chunk3.choices[0].delta.content = None
        
        async def async_stream():
            yield mock_chunk1
            yield mock_chunk2
            yield mock_chunk3
        
        mock_openai_client.chat.completions.create.return_value = async_stream()
        
        # Process message
        chunks = []
        async for chunk in service.process_message("Test message"):
            chunks.append(chunk)
        
        # Verify results
        assert chunks == ["Hello", " world"]
        mock_openai_client.chat.completions.create.assert_called_once()
        
        # Verify the call arguments
        call_args = mock_openai_client.chat.completions.create.call_args
        assert call_args[1]['model'] == "gpt-3.5-turbo"
        assert call_args[1]['stream'] is True
        assert call_args[1]['temperature'] == 0.7
        assert call_args[1]['max_tokens'] == 1000
    
    @pytest.mark.asyncio
    async def test_process_message_with_history(self, service, mock_openai_client):
        """Test message processing with conversation history."""
        # Mock the streaming response
        mock_chunk = MagicMock()
        mock_chunk.choices = [MagicMock()]
        mock_chunk.choices[0].delta.content = "Response"
        
        mock_openai_client.chat.completions.create.return_value = [mock_chunk]
        
        # Create conversation history
        history = [
            ChatMessage(role=MessageRole.USER, content="Previous message"),
            ChatMessage(role=MessageRole.ASSISTANT, content="Previous response")
        ]
        
        # Process message
        chunks = []
        async for chunk in service.process_message("New message", history):
            chunks.append(chunk)
        
        # Verify the call arguments include history
        call_args = mock_openai_client.chat.completions.create.call_args
        messages = call_args[1]['messages']
        
        assert len(messages) == 3  # history + new message
        assert messages[0]['role'] == 'user'
        assert messages[0]['content'] == 'Previous message'
        assert messages[1]['role'] == 'assistant'
        assert messages[1]['content'] == 'Previous response'
        assert messages[2]['role'] == 'user'
        assert messages[2]['content'] == 'New message'
    
    @pytest.mark.asyncio
    async def test_process_message_api_error(self, service, mock_openai_client):
        """Test message processing when API raises an error."""
        # Mock API error
        mock_openai_client.chat.completions.create.side_effect = Exception("API Error")
        
        # Process message
        chunks = []
        async for chunk in service.process_message("Test message"):
            chunks.append(chunk)
        
        # Verify error message is returned
        assert len(chunks) == 1
        assert "Error processing message: API Error" in chunks[0]
    
    @pytest.mark.asyncio
    async def test_validate_api_key_success(self, service, mock_openai_client):
        """Test successful API key validation."""
        # Mock successful API call
        mock_response = MagicMock()
        mock_openai_client.chat.completions.create.return_value = mock_response
        
        result = await service.validate_api_key()
        
        assert result is True
        mock_openai_client.chat.completions.create.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_validate_api_key_failure(self, service, mock_openai_client):
        """Test API key validation failure."""
        # Mock API error
        mock_openai_client.chat.completions.create.side_effect = Exception("Invalid API key")
        
        result = await service.validate_api_key()
        
        assert result is False 