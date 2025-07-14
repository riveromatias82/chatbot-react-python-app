# ChatGPT WebSocket Chat Application

A full-stack real-time chat application that integrates with OpenAI's ChatGPT API using WebSockets for instant communication.

## Features

- **Real-time Communication**: WebSocket-based chat with instant message streaming
- **ChatGPT Integration**: Powered by OpenAI's GPT models for intelligent responses
- **Modern UI**: Beautiful React frontend with Tailwind CSS
- **Error Handling**: Graceful error handling for API failures and connection issues
- **Auto-reconnection**: Automatic WebSocket reconnection with exponential backoff
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Message Validation**: Input validation and character limits
- **Typing Indicators**: Real-time typing indicators during AI responses

## Tech Stack

### Backend
- **Python 3.8+** with FastAPI
- **WebSockets** for real-time communication
- **OpenAI API** for ChatGPT integration
- **Pydantic** for data validation
- **python-dotenv** for environment management
- **pytest** for testing

### Frontend
- **React 18** with functional components and hooks
- **Tailwind CSS** for styling
- **WebSocket API** for real-time communication
- **Jest & React Testing Library** for testing

## Project Structure

```
chatbot-react-python-app/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration settings
│   ├── models.py               # Pydantic models
│   ├── websocket_manager.py    # WebSocket connection management
│   ├── services/
│   │   └── chatgpt_service.py  # OpenAI API integration
│   ├── tests/
│   │   ├── test_chatgpt_service.py
│   │   └── test_models.py
│   ├── requirements.txt
│   └── env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInput.js
│   │   │   ├── ChatContainer.js
│   │   │   ├── ChatMessage.js
│   │   │   └── ConnectionStatus.js
│   │   ├── hooks/
│   │   │   └── useWebSocket.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- OpenAI API key

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/riveromatias82/chatbot-react-python-app.git
cd chatbot-react-python-app
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp env.example .env

# Edit .env file and add your OpenAI API key
# OPENAI_API_KEY=your_actual_api_key_here
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Build Tailwind CSS
npx tailwindcss -i ./src/index.css -o ./src/output.css --watch
```

### 4. Running the Application

#### Start the Backend Server

```bash
cd backend
python main.py
```

The backend will start on `http://localhost:8000`

#### Start the Frontend Development Server

```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000`

### 5. Access the Application

Open your browser and navigate to `http://localhost:3000`

## Environment Variables

Create a `.env` file in the backend directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
HOST=0.0.0.0
PORT=8000
```

## API Endpoints

### REST API
- `GET /` - Health check
- `GET /health` - Server status
- `POST /api/chat` - Non-streaming chat endpoint

### WebSocket API
- `WS /ws/chat` - Real-time chat WebSocket endpoint

## Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Usage

1. **Connect**: The application automatically connects to the WebSocket server
2. **Send Messages**: Type your message in the input field and press Enter or click Send
3. **Real-time Responses**: Watch as the AI responds in real-time with streaming text
4. **Connection Status**: Monitor the connection status in the top-right corner
5. **Clear Chat**: Use the "Clear Chat" button to start a new conversation

## Error Handling

The application handles various error scenarios:

- **WebSocket Disconnection**: Automatic reconnection with exponential backoff
- **API Failures**: Graceful error messages displayed to users
- **Invalid Input**: Input validation with helpful error messages
- **Network Issues**: Connection status indicators and retry mechanisms

## Development

### Backend Development

- The backend uses FastAPI for high performance and automatic API documentation
- WebSocket connections are managed through a custom WebSocketManager
- ChatGPT integration is handled by a dedicated service class
- All data models use Pydantic for validation

### Frontend Development

- React hooks for state management and WebSocket communication
- Custom useWebSocket hook for connection management
- Tailwind CSS for responsive and modern styling
- Component-based architecture for maintainability

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the repository. 