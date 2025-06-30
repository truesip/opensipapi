const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Get API information
router.get('/info', (req, res) => {
  res.json({
    name: 'OpenSIP Voice API',
    version: '1.0.0',
    description: 'API for voice calls with TTS integration',
    authentication: 'API Key required in X-API-Key header or Authorization: Bearer <api_key>',
    endpoints: {
      tts: {
        synthesize: 'POST /api/tts/synthesize',
        voices: 'GET /api/tts/voices'
      },
      calls: {
        initiate: 'POST /api/calls/initiate',
        active: 'GET /api/calls/active',
        history: 'GET /api/calls/history',
        details: 'GET /api/calls/:callId',
        end: 'POST /api/calls/end/:callId'
      }
    }
  });
});

// Validate API key endpoint
router.get('/validate', auth, (req, res) => {
  res.json({
    success: true,
    message: 'API key is valid',
    apiKey: req.user.apiKey
  });
});

module.exports = router;
