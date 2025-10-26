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

// Claude AI endpoint - Extract criteria and return filtered properties
app.post('/api/search', async (req, res) => {
  try {
    const { userPrompt } = req.body;

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'your-api-key-here'
    });

    // Call Claude to extract structured criteria
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: `You are a property search criteria extractor. Extract structured search criteria from user queries.

Return a JSON object with these fields:
{
  "minPrice": number or null,
  "maxPrice": number or null,
  "minBedrooms": number or null,
  "maxBedrooms": number or null,
  "minBathrooms": number or null,
  "maxBathrooms": number or null,
  "propertyTypes": array of strings or null (e.g. ["Single Family", "Condo"]),
  "requiredAmenities": array of strings or null (e.g. ["pool", "garage"]),
  "minSqft": number or null,
  "maxSqft": number or null
}

Examples:
"3 bedroom house under $1 million" → {"minBedrooms": 3, "maxBedrooms": 3, "maxPrice": 1000000, "propertyTypes": ["Single Family"]}
"condo with parking" → {"propertyTypes": ["Condo"], "requiredAmenities": ["parking"]}
"large family home" → {"minBedrooms": 4, "propertyTypes": ["Single Family"]}
"affordable 2 bedroom" → {"minBedrooms": 2, "maxBedrooms": 2, "maxPrice": 700000}

Return ONLY the JSON object, no other text.`,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    });

    const criteriaText = response.content[0].text.trim();

    // Parse the criteria
    let criteria;
    try {
      // Remove markdown code blocks if present
      const jsonText = criteriaText.replace(/```json\n?|\n?```/g, '').trim();
      criteria = JSON.parse(jsonText);
    } catch (e) {
      console.error('Failed to parse criteria:', criteriaText);
      criteria = {}; // Default to empty criteria
    }

    console.log('Extracted criteria:', criteria);

    // Filter properties based on criteria
    let filteredProperties = properties.filter(property => {
      // Price filter
      if (criteria.minPrice && property.price < criteria.minPrice) return false;
      if (criteria.maxPrice && property.price > criteria.maxPrice) return false;

      // Bedrooms filter
      if (criteria.minBedrooms && property.bedrooms < criteria.minBedrooms) return false;
      if (criteria.maxBedrooms && property.bedrooms > criteria.maxBedrooms) return false;

      // Bathrooms filter
      if (criteria.minBathrooms && property.bathrooms < criteria.minBathrooms) return false;
      if (criteria.maxBathrooms && property.bathrooms > criteria.maxBathrooms) return false;

      // Square footage filter
      if (criteria.minSqft && property.sqft < criteria.minSqft) return false;
      if (criteria.maxSqft && property.sqft > criteria.maxSqft) return false;

      // Property type filter
      if (criteria.propertyTypes && criteria.propertyTypes.length > 0) {
        if (!criteria.propertyTypes.includes(property.type)) return false;
      }

      // Amenities filter
      if (criteria.requiredAmenities && criteria.requiredAmenities.length > 0) {
        const hasAllAmenities = criteria.requiredAmenities.every(amenity =>
          property.amenities.some(propAmenity =>
            propAmenity.toLowerCase().includes(amenity.toLowerCase())
          )
        );
        if (!hasAllAmenities) return false;
      }

      return true;
    });

    // Sort by price (ascending)
    filteredProperties.sort((a, b) => a.price - b.price);

    res.json({
      criteria: criteria,
      properties: filteredProperties,
      totalFound: filteredProperties.length,
      searchQuery: userPrompt
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
