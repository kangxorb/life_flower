export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { flowerName } = req.body;

    if (!flowerName) {
      return res.status(400).json({ error: 'flowerName is required' });
    }

    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    
    if (!apiKey) {
      console.error('GOOGLE_GENAI_API_KEY is not set');
      return res.status(500).json({ error: 'API key not configured' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
    
    const prompt = `A beautiful, elegant painting of a ${flowerName} in traditional Korean Minhwa style, with soft colors on hanji paper.`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{ prompt: prompt }],
        parameters: { "sampleCount": 1 }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Extract base64 image data
    let base64Image = null;
    if (result.predictions && result.predictions.length > 0) {
      // Try different possible response structures
      base64Image = result.predictions[0].bytesBase64Encoded || 
                   result.predictions[0].image?.bytesBase64Encoded;
    }

    if (!base64Image) {
      throw new Error('No image data found in API response');
    }

    const imageDataUrl = `data:image/png;base64,${base64Image}`;

    return res.status(200).json({ 
      imageDataUrl: imageDataUrl 
    });

  } catch (error) {
    console.error('Error generating image:', error);
    
    // Return error response
    return res.status(500).json({ 
      error: 'Failed to generate image',
      details: error.message 
    });
  }
}
