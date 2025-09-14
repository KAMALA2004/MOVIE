# OMDb API Setup Guide

This Movie Review Platform now uses the OMDb (Open Movie Database) API to fetch movie data, posters, and details from IMDb.

## Getting Your OMDb API Key

1. **Create an OMDb Account**
   - Go to [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)
   - Sign up for a free account

2. **Request API Access**
   - Select the "FREE" account option
   - Provide the required information
   - After registration, you'll receive an email with your unique API key

3. **Get Your API Key**
   - Check your email for the API key
   - Copy this key - you'll need it for the next step

## Setting Up the API Key

### Automatic Setup (Recommended)
The app now uses the `freekeys` library to automatically fetch OMDb API keys without requiring manual registration:

1. **No Manual Setup Required**
   - The app automatically loads a working OMDb API key using the `freekeys` library
   - No need to register for an OMDb account or manually configure API keys
   - The key is loaded dynamically when the app starts

2. **Test the Integration**
   - Start the development server with `npm run dev`
   - The app will automatically load the API key and display real movie data from IMDb
   - Check the browser console for confirmation: "OMDb API key initialized"

### Manual Setup (Alternative)
If you prefer to use your own OMDb API key:

1. **Update the OMDb Configuration**
   - Open `src/lib/omdb.ts`
   - Replace the automatic key loading with your actual API key:
   ```typescript
   const OMDB_API_KEY = 'your_actual_api_key_here';
   ```

2. **Test the Integration**
   - Save the file and refresh your app
   - You should now see real movie data, posters, and details from IMDb

## Features Available with OMDb Integration

- **Movie Data**: Get comprehensive movie information including titles, plots, release dates, IMDb ratings
- **High-Quality Posters**: Access to movie posters directly from IMDb
- **IMDb Ratings**: Official IMDb ratings and vote counts
- **Cast & Crew Information**: Director, writer, and actor information
- **Search Functionality**: Search through IMDb's extensive movie database
- **Genre Information**: Movie genres and classifications
- **Movie Details**: Runtime, release date, country, language, and more
- **Awards Information**: Academy Awards and other recognition
- **Box Office Data**: Revenue and production information

## API Rate Limits

OMDb API has the following rate limits:
- 1,000 requests per day for free accounts
- No rate limiting per second

The app includes built-in caching to minimize API calls and respect these limits.

## Fallback Mode

Without an OMDb API key, the app will use mock data to demonstrate functionality. This includes:
- Sample movie entries
- Placeholder images
- Basic movie information

## Need Help?

- OMDb API Documentation: [https://www.omdbapi.com/](https://www.omdbapi.com/)
- IMDb Website: [https://www.imdb.com/](https://www.imdb.com/)

Enjoy your Movie Review Platform! 🎬