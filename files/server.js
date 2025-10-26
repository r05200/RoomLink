require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Properties file path
const PROPERTIES_FILE = path.join(__dirname, 'properties.json');

// Load properties from file or use default
function loadProperties() {
  try {
    if (fs.existsSync(PROPERTIES_FILE)) {
      const data = fs.readFileSync(PROPERTIES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading properties:', error);
  }
  // Return default properties if file doesn't exist or error
  return getDefaultProperties();
}

// Save properties to file
function saveProperties(properties) {
  try {
    fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(properties, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving properties:', error);
    return false;
  }
}

// Default mock properties
function getDefaultProperties() {
  return [
    {
      id: 1,
      address: "48 Cavalier Place, Waterloo, ON N2L5K7",
      price: 2500,
      bedrooms: 3,
      bathrooms: 1,
      sqft: 1800,
      type: "Single Family",
      amenities: ["air conditioning", "backyard", "vacuum system"],
      lat: 43.4643,
      lng: -80.5204,
      image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      address: "101 Golden Eagle Rd 202, Waterloo, ON N2V 0H4",
      price: 1700,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 1000,
      type: "Apartment",
      amenities: ["apartment", "central air", "modern appliances"],
      lat: 43.4773,
      lng: -80.5495,
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      address: "213 - 1100 Lackner Place Kitchener, ON N2A0M1",
      price: 1900,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 700,
      type: "Apartment",
      amenities: ["gym", "parking", "appliances"],
      lat: 43.4516,
      lng: -80.4925,
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"
    },
    {
      id: 4,
      address: "67 Valleyview Road, Kitchener, ON N2E3J1",
      price: 1895,
      bedrooms: 2,
      bathrooms: 1,
      sqft: 750,
      type: "Townhouse",
      amenities: ["rooftop deck", "garage", "hardwood floors"],
      lat: 43.4186,
      lng: -80.4728,
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop"
    },
    {
      id: 5,
      address: "60 Frederick Street Unit 903, Kitchener, ON N2H0C7",
      price: 1925,
      bedrooms: 2,
      bathrooms: 1,
      sqft: 600,
      type: "Condo",
      amenities: ["balcony", "gym", "air conditioning"],
      lat: 43.4509,
      lng: -80.4925,
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop"
    },
    {
      id: 6,
      address: "123 University Ave, Waterloo, ON N2L3G1",
      price: 1650,
      bedrooms: 2,
      bathrooms: 1,
      sqft: 850,
      type: "Condo",
      amenities: ["balcony", "parking", "updated kitchen"],
      lat: 43.4723,
      lng: -80.5449,
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop"
    },
    {
      id: 7,
      address: "456 King Street North, Waterloo, ON N2J2Z5",
      price: 2800,
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2200,
      type: "Single Family",
      amenities: ["backyard", "fireplace", "garage", "finished basement"],
      lat: 43.4668,
      lng: -80.5247,
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop"
    },
    {
      id: 8,
      address: "89 Erb Street West, Waterloo, ON N2L1S9",
      price: 2100,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1650,
      type: "Townhouse",
      amenities: ["patio", "garage", "stainless appliances"],
      lat: 43.4632,
      lng: -80.5243,
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop"
    }
  ];
}

// Initialize properties
let properties = loadProperties();

// Claude AI endpoint - Extract criteria and return filtered properties
app.post('/api/search', async (req, res) => {
  try {
    const { userPrompt } = req.body;

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
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

// Post new property endpoint
app.post('/api/properties', (req, res) => {
  try {
    const newProperty = req.body;

    // Validate required fields
    if (!newProperty.address || !newProperty.price || !newProperty.bedrooms ||
      !newProperty.bathrooms || !newProperty.sqft || !newProperty.latitude ||
      !newProperty.longitude || !newProperty.propertyType) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please fill in all required property details'
      });
    }

    // Generate new ID
    const newId = properties.length > 0
      ? Math.max(...properties.map(p => p.id)) + 1
      : 1;

    // Create property object
    const property = {
      id: newId,
      address: newProperty.address,
      price: newProperty.price,
      bedrooms: newProperty.bedrooms,
      bathrooms: newProperty.bathrooms,
      sqft: newProperty.sqft,
      type: newProperty.propertyType,
      amenities: newProperty.amenities || [],
      lat: newProperty.latitude,
      lng: newProperty.longitude,
      image: newProperty.imageUrl || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400",
      roommate: newProperty.roommate || {},
      contact: newProperty.contact || {},
      datePosted: new Date().toISOString()
    };

    // Add to properties array
    properties.push(property);

    // Save to file
    if (saveProperties(properties)) {
      res.status(201).json({
        success: true,
        message: 'Property posted successfully',
        property: property
      });
    } else {
      res.status(500).json({
        error: 'Failed to save property',
        message: 'Could not save property to database'
      });
    }
  } catch (error) {
    console.error('Error posting property:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Make sure to set ANTHROPIC_API_KEY environment variable');
});
