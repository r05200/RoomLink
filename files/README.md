# 🏠 AI Property Search Website

An intelligent property search website powered by Claude AI and Google Maps API. Users can search for properties using natural language, and the AI agent will understand their requirements and find matching homes.

![AI Property Search](https://img.shields.io/badge/AI-Claude%204-blue)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- 🤖 **Natural Language Search**: Describe what you want in plain English
- 🗺️ **Interactive Map**: View properties on Google Maps with custom markers
- 💬 **Conversational AI**: Multi-turn conversations to refine your search
- 🏘️ **Property Details**: View comprehensive property information
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Real-time Updates**: Instant property filtering based on your criteria

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Anthropic API Key
- Google Maps API Key

### Step 1: Get Your API Keys

#### Anthropic API Key
1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (it starts with `sk-ant-`)

#### Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**
4. Go to Credentials → Create Credentials → API Key
5. Copy your API key
6. (Optional) Restrict the key to your domain for security

### Step 2: Install Dependencies

```bash
# Clone or download the project
cd ai-property-search

# Install Node.js dependencies
npm install
```

### Step 3: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Anthropic API key
# .env file should look like:
# ANTHROPIC_API_KEY=sk-ant-your-key-here
# PORT=3000
```

Or set it directly when running:
```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Step 4: Add Google Maps API Key

Open `public/index.html` and find this line near the bottom:

```html
<script async defer
    src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap">
</script>
```

Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual Google Maps API key.

### Step 5: Run the Server

```bash
# Start the server
npm start

# Or use nodemon for development (auto-restart on changes)
npm run dev
```

### Step 6: Open the Website

Open your browser and go to: **http://localhost:3000**

## 🎯 Usage Examples

Try these natural language queries:

- "I want a 3 bedroom house under $1 million"
- "Show me condos with parking"
- "I need a house with a pool and backyard"
- "Family home with 4+ bedrooms"
- "Affordable 2 bedroom apartments"
- "Luxury home with 5 bedrooms and modern amenities"

## 📁 Project Structure

```
ai-property-search/
├── server.js              # Express backend with Claude AI integration
├── package.json           # Node.js dependencies
├── .env.example          # Environment variables template
├── README.md             # This file
└── public/
    └── index.html        # Frontend with Google Maps
```

## 🔧 Configuration

### Mock Property Database

The server includes 8 mock properties in San Francisco. To add real properties:

1. Replace the `properties` array in `server.js` with data from a real estate API
2. Popular APIs include:
   - Zillow API (via RapidAPI)
   - Realtor.com API
   - Redfin
   - Your own database

### Customizing the AI Agent

Edit the system prompt in `server.js` to customize Claude's behavior:

```javascript
system: `You are a helpful real estate agent AI assistant...`
```

## 🌐 API Endpoints

### POST `/api/search`
Search for properties using natural language

**Request:**
```json
{
  "userPrompt": "I want a 3 bedroom house",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "message": "AI response",
  "properties": [...],
  "conversationHistory": [...]
}
```

### GET `/api/properties`
Get all available properties

**Response:**
```json
[
  {
    "id": 1,
    "address": "123 Main St",
    "price": 850000,
    "bedrooms": 3,
    ...
  }
]
```

## 🎨 Customization

### Styling
- Edit the `<style>` section in `public/index.html`
- Change colors in the gradient: `#667eea` and `#764ba2`

### Map Styling
- Modify the `styles` array in the `initMap()` function
- Use [Google Maps Styling Wizard](https://mapstyle.withgoogle.com/)

### Adding Features
- Add more property filters (square footage, price range sliders)
- Implement user authentication
- Save favorite properties
- Schedule property viewings
- Add property comparison feature

## 🐛 Troubleshooting

### "Failed to connect to server"
- Make sure the server is running on port 3000
- Check that `API_URL` in index.html matches your server URL

### "Failed to process request"
- Verify your `ANTHROPIC_API_KEY` is set correctly
- Check the server console for error messages
- Ensure you have an active Anthropic API subscription

### Map not loading
- Verify your Google Maps API key is correct
- Check that Maps JavaScript API is enabled in Google Cloud Console
- Open browser console (F12) to see error messages

### CORS errors
- The server includes CORS middleware
- If deploying to production, update CORS settings in `server.js`

## 📈 Scaling to Production

### Database Integration
Replace the mock data with a real database:

```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.get('/api/properties', async (req, res) => {
  const result = await pool.query('SELECT * FROM properties');
  res.json(result.rows);
});
```

### Deployment

#### Deploy Backend (Railway, Heroku, or AWS)
```bash
# Example for Railway
railway login
railway init
railway up
```

#### Deploy Frontend (Vercel, Netlify)
- Update `API_URL` in index.html to your backend URL
- Deploy the `public` folder

#### Environment Variables
Set these in your hosting platform:
- `ANTHROPIC_API_KEY`
- `PORT` (if needed)
- `DATABASE_URL` (if using a database)

## 🔐 Security Notes

- **Never commit API keys** to version control
- Use environment variables for sensitive data
- Restrict Google Maps API key to your domain
- Implement rate limiting for production
- Add user authentication before deploying

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📞 Support

For issues with:
- **Claude AI**: Visit [Anthropic Support](https://support.anthropic.com)
- **Google Maps**: Check [Google Maps Documentation](https://developers.google.com/maps)
- **This Project**: Open an issue on GitHub

## 🌟 Credits

Built with:
- [Claude AI](https://www.anthropic.com/claude) by Anthropic
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Express.js](https://expressjs.com/)
- [Node.js](https://nodejs.org/)

---

Made with ❤️ using Claude AI
