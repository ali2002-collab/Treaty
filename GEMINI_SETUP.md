# Gemini AI Integration Setup Guide

## Overview
This guide explains how to set up Google's Gemini AI for contract analysis in Treaty.

## Prerequisites
1. Google AI Studio account (https://makersuite.google.com/app/apikey)
2. Supabase project with the required tables and RLS policies

## Environment Variables

Add these to your `.env.local` file:

```bash
# Google AI Configuration
GOOGLE_API_KEY=your_google_ai_studio_api_key
```

## Getting Your Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Add it to your `.env.local` file

## How It Works

1. **Contract Upload**: Users upload PDF/DOCX contracts
2. **Text Extraction**: Contract text is extracted and stored
3. **AI Analysis**: Click "Analyze with AI" to trigger Gemini analysis
4. **Results Storage**: Analysis results are saved to the `analyses` table
5. **Dashboard Display**: Scores and insights appear in the dashboard

## Features

- **Strict JSON Response**: Gemini returns structured analysis data
- **Risk Scoring**: 0-100 scale with automatic favorable/unfavorable classification
- **Comprehensive Analysis**: Risks, opportunities, recommendations, negotiation points
- **Real-time Processing**: Server-side AI processing with progress indicators
- **Secure**: API key stays on server, never exposed to client

## API Schema

The analysis returns structured data including:
- Contract score (0-100)
- Risk assessment
- Key opportunities
- Actionable recommendations
- Negotiation leverage points

## Troubleshooting

- **API Key Issues**: Ensure `GOOGLE_API_KEY` is set in `.env.local`
- **Rate Limits**: Google AI has usage limits; check your quota
- **JSON Parsing**: If analysis fails, check server logs for response format issues

## Security Notes

- API key is server-side only
- RLS policies ensure users only see their own contracts
- All analysis requests are authenticated
- No sensitive data is sent to Google (only contract text) 