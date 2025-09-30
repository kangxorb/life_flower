# Life Flower - Korean Birth Flower Generator

A beautiful web application that generates traditional Korean Minhwa-style paintings of birth flowers based on your birth date.

## Features

- Interactive birth date selection
- Traditional Korean Minhwa-style flower paintings
- Instagram story format (9:16 aspect ratio)
- High-quality image export
- Responsive design with Korean aesthetic

## Setup

### Prerequisites

- Node.js (for Vercel CLI)
- Vercel account
- Google Generative AI API key

### Environment Variables

Set the following environment variable in your Vercel dashboard:

```
GOOGLE_GENAI_API_KEY=your_api_key_here
```

### Local Development

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Run locally:
```bash
vercel dev
```

3. Open http://localhost:3000 in your browser

### Deployment

Deploy to production:
```bash
vercel --prod
```

## API Endpoints

- `GET /` - Main application
- `POST /api/generate-image` - Generate flower image using Google Imagen 3

## Technology Stack

- HTML5, CSS3, JavaScript
- Tailwind CSS
- html2canvas
- Google Imagen 3 API
- Vercel Serverless Functions

## Project Structure

```
/
├── index.html              # Main application
├── api/
│   └── generate-image.js   # Serverless function for image generation
├── .gitignore
└── README.md
```

## Usage

1. Select your birth month and day
2. Click "나의 탄생화 확인하기" (Check My Birth Flower)
3. Wait for the AI-generated Minhwa painting
4. Click "인스타그램에 공유하기" (Share to Instagram) to download
5. Upload to Instagram Stories

## Notes

- The application uses Google Imagen 3 API for generating traditional Korean Minhwa-style paintings
- Images are optimized for Instagram story format (9:16 aspect ratio)
- High-resolution capture uses device pixel ratio for better quality
- Fallback SVG gradient is provided if API fails
