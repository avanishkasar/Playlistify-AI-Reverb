# Apify Playlist AI - Integration Guide

## Project Overview

This project was built for the **Apify $1M Challenge** and showcases a creative AI-powered music playlist generator that uses Apify Actors to scrape and analyze music data.

## Features

- **AI-Powered Playlist Generation**: Uses natural language descriptions, genres, moods, and activities to create personalized playlists
- **Apify Actor Integration**: Leverages Apify's MCP (Model Context Protocol) endpoint to fetch music recommendations
- **User Authentication**: Secure user accounts with profile management
- **Playlist Management**: Save and manage your generated playlists
- **Issue Reporting**: Built-in bug tracking system
- **AI Chatbot**: Interactive assistant to help users with the app
- **Responsive Design**: Beautiful Spotify-inspired dark theme

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Lovable Cloud (Supabase)
- **AI**: Lovable AI Gateway (Gemini & GPT-5)
- **Data Source**: Apify Actors via MCP endpoint

## Apify Integration

### Current Implementation

The app currently integrates with Apify through the MCP endpoint:

```typescript
const response = await fetch("https://zvwgqek11lrg.runs.apify.net/mcp", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tool: "recommend",
    input: {
      seedGenres: selectedGenres.slice(0, 5),
      limit: trackCount,
    },
  }),
});
```

### Custom Apify Actor Ideas

To make this project even more competitive for the challenge, consider creating custom Apify Actors for:

1. **Music Data Scraper Actor**
   - Scrape music metadata from multiple sources (Spotify, Apple Music, SoundCloud)
   - Extract trending songs, artist information, and album details
   - Build a comprehensive music database

2. **Sentiment Analysis Actor**
   - Analyze song lyrics to determine mood and emotional content
   - Categorize songs by energy level, positivity, and themes
   - Enhance playlist matching accuracy

3. **User Behavior Actor**
   - Track playlist generation patterns
   - Analyze popular genre combinations
   - Provide insights on user preferences

4. **Social Media Music Trends Actor**
   - Scrape TikTok, Instagram, and Twitter for trending music
   - Identify viral songs and emerging artists
   - Keep playlists fresh with current trends

## Database Schema

The project uses the following tables:

- **profiles**: User profile information
- **playlists**: Saved user playlists with tracks and metadata
- **issues**: Bug reports and feature requests
- **chat_messages**: AI chatbot conversation history

## Authentication Flow

1. Users can sign up with email/password
2. Email confirmation is auto-enabled for development
3. User profiles are automatically created via database trigger
4. Authenticated users can save and manage playlists

## Deployment

The app is deployed on Lovable Cloud with:
- Automatic backend deployment (database, auth, edge functions)
- Frontend updates via the Publish button
- Real-time database updates with RLS policies

## Future Enhancements

- Direct Spotify API integration for playlist export
- Collaborative playlists
- Playlist sharing and discovery
- Music recommendation algorithm improvements
- Advanced analytics dashboard

## Contributing

This project is open for contributions! Feel free to:
- Report bugs via the Issue Reporting page
- Suggest new features
- Improve the Apify Actor integration
- Enhance the UI/UX

## License

MIT License - See LICENSE file for details

## Contact

For questions or collaboration opportunities:
- Email: contact@apifyplaylist.com
- Twitter: @apifyplaylist
- GitHub: github.com/apifyplaylist

---

Built with ❤️ for the Apify $1M Challenge
