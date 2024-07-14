import json
import uuid
from typing import Dict, Set
from fastapi import WebSocket, WebSocketDisconnect
from models import WebSocketMessage, ConnectionStatus

class WebSocketManager:
    """Manages WebSocket connections and message routing."""
    
    def __init__(self):
        """Initialize the WebSocket manager."""
        self.active_connections: Dict[str, WebSocket] = {}
        self.conversation_connections: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, conversation_id: str = None) -> str:
        """
        Accept a new WebSocket connection.
        
        Args:
            websocket: The WebSocket connection
            conversation_id: Optional conversation ID for grouping connections
            
        Returns:
            str: The connection ID
        """
        await websocket.accept()
        
        # Generate unique connection ID
        connection_id = str(uuid.uuid4())
        self.active_connections[connection_id] = websocket
        
        # Add to conversation group if provided
        if conversation_id:
            if conversation_id not in self.conversation_connections:
                self.conversation_connections[conversation_id] = set()
            self.conversation_connections[conversation_id].add(connection_id)
        
        # Send connection status
        status_message = ConnectionStatus(
            status="connected",
            message="Successfully connected to chat server"
        )
        
        await self.send_personal_message(
            connection_id,
            WebSocketMessage(
                type="status",
                data=status_message.dict(),
                conversation_id=conversation_id
            )
        )
        
        return connection_id
    
    async def disconnect(self, connection_id: str):
        """
        Remove a WebSocket connection.
        
        Args:
            connection_id: The connection ID to remove
        """
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
        
        # Remove from conversation groups
        for conversation_id, connections in self.conversation_connections.items():
            if connection_id in connections:
                connections.remove(connection_id)
                if not connections:
                    del self.conversation_connections[conversation_id]
    
    async def send_personal_message(self, connection_id: str, message: WebSocketMessage):
        """
        Send a message to a specific connection.
        
        Args:
            connection_id: The target connection ID
            message: The message to send
        """
        if connection_id in self.active_connections:
            try:
                await self.active_connections[connection_id].send_text(
                    message.json()
                )
            except WebSocketDisconnect:
                await self.disconnect(connection_id)
            except Exception as e:
                print(f"Error sending message to {connection_id}: {e}")
                await self.disconnect(connection_id)
    
    async def send_to_conversation(self, conversation_id: str, message: WebSocketMessage):
        """
        Send a message to all connections in a conversation.
        
        Args:
            conversation_id: The conversation ID
            message: The message to send
        """
        if conversation_id in self.conversation_connections:
            connections_to_remove = []
            
            for connection_id in self.conversation_connections[conversation_id]:
                try:
                    await self.active_connections[connection_id].send_text(
                        message.json()
                    )
                except WebSocketDisconnect:
                    connections_to_remove.append(connection_id)
                except Exception as e:
                    print(f"Error sending message to {connection_id}: {e}")
                    connections_to_remove.append(connection_id)
            
            # Clean up disconnected connections
            for connection_id in connections_to_remove:
                await self.disconnect(connection_id)
    
    async def broadcast(self, message: WebSocketMessage):
        """
        Send a message to all active connections.
        
        Args:
            message: The message to broadcast
        """
        connections_to_remove = []
        
        for connection_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(message.json())
            except WebSocketDisconnect:
                connections_to_remove.append(connection_id)
            except Exception as e:
                print(f"Error broadcasting to {connection_id}: {e}")
                connections_to_remove.append(connection_id)
        
        # Clean up disconnected connections
        for connection_id in connections_to_remove:
            await self.disconnect(connection_id)
    
    def get_connection_count(self) -> int:
        """
        Get the number of active connections.
        
        Returns:
            int: Number of active connections
        """
        return len(self.active_connections)

# Global WebSocket manager instance
websocket_manager = WebSocketManager() 