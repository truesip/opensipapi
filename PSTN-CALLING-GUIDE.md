# PSTN Outbound Calling Guide

This guide explains how to make outbound calls to PSTN (Public Switched Telephone Network) numbers using the OpenSIP Voice API.

## Prerequisites

1. **SIP Trunk Provider**: You need a SIP trunk provider that allows outbound PSTN calls. Popular providers include:
   - Twilio
   - Vonage (Nexmo)
   - Bandwidth
   - Flowroute
   - Local telecom providers

2. **Provider Configuration**: Get the following from your SIP provider:
   - SIP server hostname/IP
   - Username
   - Password
   - Any specific routing requirements

## Configuration

### 1. Environment Variables

Set these environment variables with your SIP provider details:

```bash
SIP_PROVIDER_HOST=sip.yourprovider.com
SIP_PROVIDER_PORT=5060
SIP_USERNAME=your_username
SIP_PASSWORD=your_password
```

### 2. OpenSIPS Configuration

Update the OpenSIPS configuration file (`config/opensips/opensips-pstn.cfg`) with your provider details:

```
define PSTN_GATEWAY "sip.yourprovider.com:5060"
define PSTN_USERNAME "your_username"
define PSTN_PASSWORD "your_password"
```

## Making Outbound PSTN Calls

### API Endpoint

```
POST /api/calls/initiate
```

### Request Format

#### Option 1: Using Pre-recorded Audio

```json
{
  "fromNumber": "+1234567890",
  "toNumber": "+1987654321",
  "audioFile": "path/to/audio.mp3"
}
```

#### Option 2: Using Text-to-Speech

```json
{
  "fromNumber": "+1234567890",
  "toNumber": "+1987654321",
  "text": "Hello, this is an automated call from your API server."
}
```

### Request Headers

```
X-API-Key: your_api_key_here
Content-Type: application/json
```

### Example Calls

#### 1. Call with TTS

```bash
curl -X POST http://localhost:3000/api/calls/initiate \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "fromNumber": "+1234567890",
    "toNumber": "+1987654321",
    "text": "Hello, this is a test call from the API server. Thank you for listening."
  }'
```

#### 2. Call with Audio File

```bash
curl -X POST http://localhost:3000/api/calls/initiate \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "fromNumber": "+1234567890",
    "toNumber": "+1987654321",
    "audioFile": "uploads/audio_1640995200000.mp3"
  }'
```

### Response Format

```json
{
  "success": true,
  "message": "Call initiated successfully to PSTN number",
  "callId": "507f1f77bcf86cd799439011",
  "callType": "PSTN",
  "opensipsId": "dialog_id_123",
  "audioFile": "tts_1640995200000.mp3"
}
```

## Number Formats

The API automatically detects PSTN numbers based on format:

- **PSTN Numbers**: Must be 7-15 digits, optionally starting with `+`
  - Examples: `+1234567890`, `1234567890`, `447700900123`
- **SIP Numbers**: Any other format (e.g., `user@domain.com`)

## Call Management

### Check Call Status

```bash
curl -X GET http://localhost:3000/api/calls/status/CALL_ID \
  -H "X-API-Key: your_api_key_here"
```

### End Call

```bash
curl -X POST http://localhost:3000/api/calls/end/CALL_ID \
  -H "X-API-Key: your_api_key_here"
```

### View Call History

```bash
curl -X GET http://localhost:3000/api/calls/history \
  -H "X-API-Key: your_api_key_here"
```

## Troubleshooting

### Common Issues

1. **"Call failed" Error**
   - Check SIP provider credentials
   - Verify network connectivity to SIP provider
   - Check OpenSIPS logs: `docker-compose logs opensips`

2. **"Invalid number format" Error**
   - Ensure PSTN numbers are 7-15 digits
   - Use international format (e.g., +1234567890)

3. **"TTS Error" when using text**
   - Verify Google API key is valid
   - Check Google Cloud TTS quota
   - Ensure text is not empty

### Debugging

1. **Check API Logs**
   ```bash
   docker-compose logs api
   ```

2. **Check OpenSIPS Logs**
   ```bash
   docker-compose logs opensips
   ```

3. **Test API Health**
   ```bash
   curl http://localhost:3000/health
   ```

## Cost Considerations

- **Google TTS**: Charged per character
- **SIP Provider**: Charged per minute for outbound calls
- **MongoDB**: Storage costs for call records

## Security Best Practices

1. **API Key Security**
   - Use strong API keys
   - Rotate keys regularly
   - Restrict API access by IP if possible

2. **SIP Security**
   - Use strong SIP passwords
   - Enable SIP authentication
   - Monitor for unauthorized usage

3. **Network Security**
   - Use HTTPS for API calls
   - Implement rate limiting
   - Monitor call patterns for abuse

## Provider-Specific Notes

### Twilio
- Use Twilio SIP trunking
- Format: `sip.twilio.com`
- Requires account SID and auth token

### Vonage/Nexmo
- Use Vonage SIP endpoints
- Format: `sip.nexmo.com`
- Requires API key and secret

### Bandwidth
- Use Voice API SIP trunking
- Custom SIP endpoints per account
- Requires account credentials

## Example Integration

Here's a complete example of integrating PSTN calling into your application:

```javascript
const axios = require('axios');

async function makeOutboundCall(fromNumber, toNumber, message) {
  try {
    const response = await axios.post('http://localhost:3000/api/calls/initiate', {
      fromNumber,
      toNumber,
      text: message
    }, {
      headers: {
        'X-API-Key': 'your_api_key_here',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Call initiated:', response.data);
    return response.data.callId;
  } catch (error) {
    console.error('Call failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
makeOutboundCall('+1234567890', '+1987654321', 'Hello from the API!')
  .then(callId => console.log('Call ID:', callId))
  .catch(error => console.error('Error:', error));
```

This setup enables your API server to make outbound calls to any PSTN number worldwide, using either pre-recorded audio or text-to-speech conversion.
