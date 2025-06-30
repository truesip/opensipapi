# OpenSIP Voice API

A Docker-based API server that integrates OpenSIP for voice calls with Google Text-to-Speech capabilities. Make outbound calls to PSTN numbers with text-to-speech or pre-recorded audio.

## Features

- 🔐 **API Key Authentication** - Simple and secure
- 🗣️ **Google Text-to-Speech Integration** - Convert text to speech on-the-fly
- 📞 **Outbound PSTN Calling** - Call real phone numbers worldwide
- 🎵 **Multiple Audio Formats** - Support for MP3 and WAV
- 📊 **Call Management & Tracking** - Full call history and status monitoring
- 🐳 **Docker Deployment** - Enterprise-ready containerized setup
- 🔄 **SIP Provider Integration** - Works with Twilio, Vonage, Bandwidth, etc.
- 📈 **Health Monitoring** - Built-in health checks and logging

## Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/your-username/opensipapi.git
cd opensipapi

# 2. Set your API keys
export API_KEY="your-strong-api-key-here"
export GOOGLE_API_KEY="your-google-api-key-here"
export SIP_PROVIDER_HOST="sip.yourprovider.com"
export SIP_USERNAME="your_sip_username"
export SIP_PASSWORD="your_sip_password"

# 3. Deploy
chmod +x deploy.sh
./deploy.sh

# 4. Test
curl http://localhost:3000/health
```

## 📚 Documentation

- **[📖 Complete Installation Guide](INSTALLATION-GUIDE.md)** - Step-by-step setup instructions
- **[📞 PSTN Calling Guide](PSTN-CALLING-GUIDE.md)** - How to make outbound calls
- **[🔧 API Reference](#api-endpoints)** - Complete API documentation

## API Endpoints

### System
- `GET /health` - API health check
- `GET /api/auth/info` - API information and endpoints
- `GET /api/auth/validate` - Validate API key

### Text-to-Speech
- `POST /api/tts/synthesize` - Convert text to speech (MP3/WAV)
- `GET /api/tts/voices` - List available Google voices

### Calls
- `POST /api/calls/initiate` - Start outbound call (PSTN/SIP)
- `GET /api/calls/active` - List active calls
- `GET /api/calls/history` - Get call history with pagination
- `GET /api/calls/:callId` - Get specific call details
- `GET /api/calls/status/:callId` - Get call status
- `POST /api/calls/end/:callId` - End active call

## Usage Examples

### 1. Make a call with Text-to-Speech
```bash
curl -X POST http://localhost:3000/api/calls/initiate \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "fromNumber": "+1234567890",
    "toNumber": "+1987654321",
    "text": "Hello, this is an automated call from your API server."
  }'
```

### 2. Make a call with audio file
```bash
curl -X POST http://localhost:3000/api/calls/initiate \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "fromNumber": "+1234567890",
    "toNumber": "+1987654321",
    "audioFile": "uploads/audio.mp3"
  }'
```

### 3. Convert text to speech
```bash
curl -X POST http://localhost:3000/api/tts/synthesize \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test message",
    "audioFormat": "MP3",
    "language": "en-US"
  }'
```

### 4. Check call status
```bash
curl -X GET http://localhost:3000/api/calls/history \
  -H "X-API-Key: your-api-key"
```

## Environment Variables

- `NODE_ENV`: Environment (development/production)
- `PORT`: API server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
- `API_KEY`: Your API key for authentication
- `GOOGLE_API_KEY`: Google Cloud Text-to-Speech API key
- `SIP_PROVIDER_HOST`: SIP provider hostname
- `SIP_PROVIDER_PORT`: SIP provider port (default: 5060)
- `SIP_USERNAME`: SIP provider username
- `SIP_PASSWORD`: SIP provider password

## SIP Providers Supported

- **Twilio** - `sip.twilio.com`
- **Vonage/Nexmo** - `sip.nexmo.com`
- **Bandwidth** - Custom endpoints
- **Flowroute** - `sip.flowroute.com`
- **Any SIP-compliant provider**

## Error Handling

The API includes comprehensive error handling for:
- Invalid API keys
- Missing required fields
- Invalid phone number formats
- Google TTS API errors
- SIP provider connection issues
- Database connection errors
- OpenSIP command failures

## License

ISC
