const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Call = require('../models/call');
const { exec } = require('child_process');
const util = require('util');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const execPromise = util.promisify(exec);

// Initiate a call
router.post('/initiate', auth, async (req, res) => {
  try {
    const { fromNumber, toNumber, audioFile, text } = req.body;

    if (!fromNumber || !toNumber) {
      return res.status(400).json({ error: 'fromNumber and toNumber are required' });
    }

    if (!audioFile && !text) {
      return res.status(400).json({ error: 'Either audioFile or text is required' });
    }

    // Create a new call record
    const call = new Call({
      fromNumber,
      toNumber,
      audioFile: audioFile || `tts_${Date.now()}.mp3`,
      userId: 'api-user'
    });

    // If text is provided, convert to speech first
    let finalAudioFile = audioFile;
    if (text && !audioFile) {
      try {
        const ttsResponse = await axios.post(
          `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_API_KEY}`,
          {
            input: { text },
            voice: { languageCode: 'en-US', name: 'en-US-Standard-A' },
            audioConfig: { audioEncoding: 'MP3' }
          },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const filename = `tts_${Date.now()}.mp3`;
        const filePath = path.join(__dirname, '../../uploads', filename);
        await fs.writeFile(filePath, ttsResponse.data.audioContent, 'base64');
        finalAudioFile = filePath;
        call.audioFile = filename;
      } catch (ttsError) {
        call.status = 'failed';
        await call.save();
        return res.status(400).json({ error: `TTS Error: ${ttsError.message}` });
      }
    }

    // Check if it's a PSTN number (contains only digits and is 7+ characters)
    const isPSTN = /^[+]?[0-9]{7,15}$/.test(toNumber);
    
    let command;
    if (isPSTN) {
      // For PSTN calls, use a different approach
      command = `opensipsctl fifo dlg_bridge "${fromNumber}" "${toNumber}" "${finalAudioFile}"`;
    } else {
      // For SIP calls
      command = `opensipsctl fifo dlg_create_dialog "${fromNumber}" "${toNumber}" "${finalAudioFile}"`;
    }
    
    try {
      const { stdout, stderr } = await execPromise(command);
      
      if (stderr && !stderr.includes('warning')) {
        call.status = 'failed';
        await call.save();
        throw new Error(stderr);
      }

      call.status = 'initiated';
      await call.save();
      
      res.json({
        success: true,
        message: `Call initiated successfully to ${isPSTN ? 'PSTN' : 'SIP'} number`,
        callId: call._id,
        callType: isPSTN ? 'PSTN' : 'SIP',
        opensipsId: stdout.trim(),
        audioFile: call.audioFile
      });
    } catch (execError) {
      call.status = 'failed';
      await call.save();
      throw execError;
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get call status
router.get('/status/:callId', auth, async (req, res) => {
  try {
    const { callId } = req.params;
    
    const command = `opensipsctl fifo dlg_list_dialog ${callId}`;
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr) {
      throw new Error(stderr);
    }
    
    res.json({
      success: true,
      status: stdout.trim()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// End a call
router.post('/end/:callId', auth, async (req, res) => {
  try {
    const { callId } = req.params;
    
    const command = `opensipsctl fifo dlg_end_dialog ${callId}`;
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr) {
      throw new Error(stderr);
    }
    
    res.json({
      success: true,
      message: 'Call ended successfully'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// List active calls
router.get('/active', auth, async (req, res) => {
  try {
    const command = 'opensipsctl fifo dlg_list';
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr) {
      throw new Error(stderr);
    }
    
    // Get active calls from database
    const activeCalls = await Call.find({
      status: { $in: ['initiated', 'ringing', 'in-progress'] }
    }).select('-__v');

    res.json({
      success: true,
      opensipsCalls: stdout.trim().split('\n').filter(line => line.length > 0),
      calls: activeCalls
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get call history
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const calls = await Call.find(query)
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Call.countDocuments(query);

    res.json({
      success: true,
      calls,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get call details
router.get('/:callId', auth, async (req, res) => {
  try {
    const call = await Call.findOne({
      _id: req.params.callId
    }).select('-__v');

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    res.json({
      success: true,
      call
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
