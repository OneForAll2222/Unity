# API Keys Setup Guide

## Required API Keys

To make your app work properly, you need to set up at least one AI API key. You can use either OpenAI or Google Gemini (or both for automatic fallback).

### 1. OpenAI API Key (Recommended)

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. In your `.env` file, uncomment and replace:
   ```
   OPENAI_API_KEY=your_actual_openai_key_here
   ```

**Cost**: OpenAI charges per token. GPT-4o costs about $0.005 per 1K input tokens.

### 2. Google Gemini API Key (Alternative/Fallback)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIzaSy`)
5. In your `.env` file, uncomment and replace:
   ```
   GEMINI_API_KEY=your_actual_gemini_key_here
   ```

**Cost**: Gemini has a generous free tier with 15 requests per minute.

### 3. Recommended Setup

For best results, set up both APIs:
```env
# Uncomment and add your keys
OPENAI_API_KEY=sk-your_actual_openai_key
GEMINI_API_KEY=AIzaSy_your_actual_gemini_key
```

The app will try OpenAI first, then fallback to Gemini if OpenAI fails.

### 4. Testing Your Setup

After adding your API keys:
1. Restart your development server
2. Go to the Assistant tab in your app
3. Try sending a message
4. Check the console for any error messages

### 5. Security Notes

- Never commit real API keys to version control
- Keep your `.env` file in `.gitignore`
- API keys are server-side only and won't be exposed to clients
- Monitor your API usage to avoid unexpected charges

### 6. Troubleshooting

**"Both OpenAI and Gemini APIs failed"**
- Check that your API keys are correctly formatted
- Verify your API keys are active and have credits/quota
- Check your internet connection
- Look at the server console for detailed error messages

**OpenAI specific errors:**
- `401 Unauthorized`: Invalid API key
- `429 Too Many Requests`: Rate limit exceeded
- `402 Payment Required`: No credits remaining

**Gemini specific errors:**
- `400 Bad Request`: Invalid request format
- `403 Forbidden`: API key doesn't have permission
- `429 Too Many Requests`: Quota exceeded