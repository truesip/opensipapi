const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');

// Convert text to speech
router.post('/synthesize', auth, async (req, res) => {
  try {
    const { text, language = 'en-US', voiceName = 'en-US-Standard-A', audioFormat = 'MP3' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!['MP3', 'WAV'].includes(audioFormat.toUpperCase())) {
      return res.status(400).json({ error: 'Audio format must be MP3 or WAV' });
    }

    // Google Cloud Text-to-Speech API request
    const requestData = {
      input: { text },
      voice: { languageCode: language, name: voiceName },
      audioConfig: {
        audioEncoding: audioFormat.toUpperCase() === 'MP3' ? 'MP3' : 'LINEAR16',
      },
    };

    // Call Google TTS API
    const response = await axios.post(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_API_KEY}`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const audioContent = response.data.audioContent;

    // Generate unique filename
    const filename = `audio_${Date.now()}.${audioFormat.toLowerCase()}`;
    const filePath = path.join(__dirname, '../../uploads', filename);

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../../uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Save the audio file (audioContent is base64 encoded)
    await fs.writeFile(filePath, audioContent, 'base64');

    res.json({
      success: true,
      filename,
      path: filePath
    });
  } catch (error) {
    if (error.response) {
      res.status(400).json({ error: `Google API Error: ${error.response.data.error.message}` });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Get available voices
router.get('/voices', auth, async (req, res) => {
  try {
    const response = await axios.get(
      `https://texttospeech.googleapis.com/v1/voices?key=${process.env.GOOGLE_API_KEY}`
    );
    
    res.json(response.data.voices);
  } catch (error) {
    if (error.response) {
      res.status(400).json({ error: `Google API Error: ${error.response.data.error.message}` });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

module.exports = router;
