// api/generate-image.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { flowerName, lang } = req.body;

    if (!flowerName) {
      return res.status(400).json({ error: 'flowerName is required' });
    }

    // 한국어 → 영어 변환 매핑
    const mapping = {
      '장미': 'rose',
      '튤립': 'tulip',
      '해바라기': 'sunflower',
      '국화': 'chrysanthemum',
      '수선화': 'daffodil',
      '무궁화': 'hibiscus',
      '백합': 'lily',
    };

    let query = flowerName;
    if (lang === 'ko' && mapping[flowerName]) {
      query = mapping[flowerName];
    }

    const apiKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Unsplash API key not configured' });
    }

    const apiUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
      query
    )}&orientation=portrait&client_id=${apiKey}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();

    return res.status(200).json({
      imageDataUrl: data.urls?.regular || data.urls?.full || null,
      photographer: data.user?.name || 'Unknown',
      photographerLink: data.user?.links?.html || 'https://unsplash.com',
    });
  } catch (error) {
    console.error('Error fetching from Unsplash:', error);
    return res.status(500).json({ error: 'Failed to fetch image' });
  }
}
