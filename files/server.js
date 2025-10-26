const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Mock property database
const properties = [
  {
    id: 1,
    address: "123 Maple Street, San Francisco, CA 94102",
    price: 850000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    type: "Single Family",
    amenities: ["garage", "backyard", "updated kitchen"],
    lat: 37.7749,
    lng: -122.4194,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400"
  },
  {
    id: 2,
    address: "456 Oak Avenue, San Francisco, CA 94103",
    price: 1200000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2400,
    type: "Single Family",
    amenities: ["pool", "garage", "modern appliances", "backyard"],
    lat: 37.7699,
    lng: -122.4124,
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400"
  },
  {
    id: 3,
    address: "789 Pine Road, San Francisco, CA 94104",
    price: 650000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    type: "Condo",
    amenities: ["gym", "parking", "doorman"],
    lat: 37.7899,
    lng: -122.4024,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400"
  },
  {
    id: 4,
    address: "321 Birch Lane, San Francisco, CA 94105",
    price: 950000,
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 2000,
    type: "Townhouse",
    amenities: ["rooftop deck", "garage", "hardwood floors"],
    lat: 37.7849,
    lng: -122.4294,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400"
  },
  {
    id: 5,
    address: "555 Cedar Street, San Francisco, CA 94106",
    price: 1500000,
    bedrooms: 5,
    bathrooms: 4,
    sqft: 3200,
    type: "Single Family",
    amenities: ["pool", "spa", "wine cellar", "garage", "home theater"],
    lat: 37.7649,
    lng: -122.4394,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400"
  },
  {
    id: 6,
    address: "888 Elm Drive, San Francisco, CA 94107",
    price: 720000,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 1100,
    type: "Condo",
    amenities: ["balcony", "parking", "updated kitchen"],
    lat: 37.7599,
    lng: -122.3994,
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400"
  },
  {
    id: 7,
    address: "999 Willow Court, San Francisco, CA 94108",
    price: 1100000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2200,
    type: "Single Family",
    amenities: ["backyard", "fireplace", "garage", "solar panels"],
    lat: 37.7949,
    lng: -122.4094,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400"
  },
  {
    id: 8,
    address: "234 Spruce Avenue, San Francisco, CA 94109",
    price: 890000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1650,
    type: "Townhouse",
    amenities: ["patio", "garage", "stainless appliances"],
    lat: 37.7799,
    lng: -122.4494,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400"
  }
];

// Claude AI endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { userPrompt, conversationHistory } = req.body;
    
    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'your-api-key-here'
    });

    // Build conversation messages
    const messages = conversationHistory || [];
    messages.push({
      role: 'user',
      content: userPrompt
    });

    // Call Claude to extract criteria and search
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: `You are a helpful real estate agent AI assistant. Your job is to:
1. Understand the user's property requirements from their natural language input
2. Extract structured criteria (price range, bedrooms, bathrooms, location, property type, amenities)
3. Search the available properties
4. Present the best matches in a friendly, conversational way

Available properties database:
${JSON.stringify(properties, null, 2)}

When responding:
- Extract the criteria from the user's message
- Filter properties that match their requirements
- Present 3-5 best matches with details
- Be conversational and helpful
- Ask clarifying questions if needed
- Format your response with property details including address, price, bedrooms, bathrooms, and why it matches their criteria`,
      messages: messages
    });

    const assistantMessage = response.content[0].text;

    // Extract property IDs mentioned in the response (simple pattern matching)
    const matchedPropertyIds = [];
    properties.forEach(prop => {
      if (assistantMessage.includes(prop.address) || 
          assistantMessage.includes(prop.id.toString())) {
        matchedPropertyIds.push(prop.id);
      }
    });

    // Get matched properties
    const matchedProperties = properties.filter(p => 
      matchedPropertyIds.includes(p.id)
    );

    res.json({
      message: assistantMessage,
      properties: matchedProperties.length > 0 ? matchedProperties : properties.slice(0, 3),
      conversationHistory: [...messages, {
        role: 'assistant',
        content: assistantMessage
      }]
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message 
    });
  }
});

// Get all properties endpoint
app.get('/api/properties', (req, res) => {
  res.json(properties);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Make sure to set ANTHROPIC_API_KEY environment variable');
});
