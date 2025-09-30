// /api/generate-image.js
// Vercel Serverless Function (Node 18+)
// 필요한 환경변수: UNSPLASH_ACCESS_KEY

export default async function handler(req, res) {
  // 간단 CORS (원하면 도메인 제한 가능)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return res.status(500).json({ error: 'UNSPLASH_ACCESS_KEY is not set' });
  }

  try {
    // 입력 받기 (POST: JSON body, GET: querystring)
    const body = req.method === 'POST' ? req.body || {} : req.query || {};
    const flowerName =
      (body.flowerName || body.q || '').toString().trim() || 'flower';
    // 언어 힌트 (ko/en) – 검색엔진에 직접 옵션은 없지만, 키워드에 반영
    const lang = (body.lang || 'ko').toString().toLowerCase();
    const localeHint = lang === 'en' ? '' : ' korean minhwa hanji';

    // 검색 쿼리 만들기
    const query = `${flowerName}${localeHint}`.trim();

    // Unsplash Search API
    const url = new URL('https://api.unsplash.com/search/photos');
    url.searchParams.set('query', query);
    url.searchParams.set('per_page', '1');
    url.searchParams.set('orientation', 'portrait'); // 스토리 배경에 좋아요

    const resp = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
    });

    if (!resp.ok) {
      const t = await resp.text().catch(() => '');
      throw new Error(`Unsplash HTTP ${resp.status}: ${t}`);
    }

    const data = await resp.json();

    // 결과가 없으면 랜덤 소스 fallback
    if (!data.results || data.results.length === 0) {
      return res.status(200).json({
        imageUrl: 'https://source.unsplash.com/360x640/?flower,pattern',
        photographer: null,
        photographerLink: null,
        source: 'fallback',
      });
    }

    const photo = data.results[0];

    // 고화질 URL(가로세로 자동 맞춤). story-size 에서 cover로 쓰기 좋음
    const imageUrl =
      (photo.urls && (photo.urls.regular || photo.urls.full || photo.urls.raw)) ||
      'https://source.unsplash.com/360x640/?flower';

    const photographer = photo.user?.name || null;
    const photographerLink = photo.user?.links?.html || null;

    // 크레딧 표기 규정상 track download 호출 권장 (비차단 fire-and-forget)
    const downloadTrack = photo.links?.download_location;
    if (downloadTrack) {
      fetch(`${downloadTrack}&client_id=${accessKey}`).catch(() => {});
    }

    return res.status(200).json({
      imageUrl,
      photographer,
      photographerLink,
      source: 'unsplash',
    });
  } catch (err) {
    console.error('[generate-image] Error:', err);
    // 완전 실패시에도 프론트 안깨지게 안전한 기본값 반환
    return res.status(200).json({
      imageUrl: 'https://source.unsplash.com/360x640/?flower,nature',
      photographer: null,
      photographerLink: null,
      source: 'error-fallback',
    });
  }
}
