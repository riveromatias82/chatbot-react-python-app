import asyncio
import json
from typing import AsyncGenerator, Optional
from openai import AsyncOpenAI
from config import settings
from models import ChatMessage, MessageRole

class ChatGPTService:
    """Service for interacting with OpenAI ChatGPT API."""
    
    def __init__(self):
        """Initialize the ChatGPT service."""
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not set in environment variables")
        
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
    
    async def process_message(
        self, 
        user_message: str, 
        conversation_history: Optional[list[ChatMessage]] = None
    ) -> AsyncGenerator[str, None]:
        """
        Process a user message and stream the response from ChatGPT.
        
        Args:
            user_message: The user's input message
            conversation_history: Previous messages in the conversation
            
        Yields:
            str: Chunks of the response as they are received
        """
        try:
            # Prepare messages for the API
            messages = []
            
            # Add system message if no history
            if not conversation_history:
                messages.append({
                    "role": "system",
                    "content": "You are a helpful AI assistant. Provide clear, concise, and helpful responses."
                })
            else:
                # Add conversation history
                for msg in conversation_history:
                    messages.append({
                        "role": msg.role.value,
                        "content": msg.content
                    })
            
            # Add the current user message
            messages.append({
                "role": "user",
                "content": user_message
            })
            
            # Stream the response from ChatGPT
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                stream=True,
                temperature=0.7,
                max_tokens=1000
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            error_message = f"Error processing message: {str(e)}"
            yield error_message
    
    async def validate_api_key(self) -> bool:
        """
        Validate that the OpenAI API key is working.
        
        Returns:
            bool: True if API key is valid, False otherwise
        """
        try:
            # Make a simple test call
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=5
            )
            return True
        except Exception:
            return False

# Global instance
chatgpt_service = ChatGPTService() 