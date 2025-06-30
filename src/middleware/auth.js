const auth = (req, res, next) => {
  try {
    const apiKey = req.header('X-API-Key') || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required. Use X-API-Key header or Authorization: Bearer <api_key>' });
    }

    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Set user info for logging purposes
    req.user = { apiKey: apiKey.substring(0, 8) + '...' };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = auth;
