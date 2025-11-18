// Global variables
let map;
let markers = [];
let properties = [];
let currentProperty = null;
let placesService;
let placeMarkers = [];

// API configuration
const API_URL = 'http://localhost:3000';

// Initialize map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 43.4723, lng: -80.5449 },
        zoom: 13,

    });
    placesService = new google.maps.places.PlacesService(map);
    loadAllProperties();
}

// Load all properties on startup
async function loadAllProperties() {
    try {
        const response = await fetch(`${API_URL}/api/properties`);
        const data = await response.json();
        displayProperties(data, 'All Properties');
    } catch (error) {
        showError('Failed to load properties. Make sure the server is running.');
    }
}

// Display properties
function displayProperties(propertiesList, headerText = 'Search Results', criteria = null) {
    properties = propertiesList;
    const grid = document.getElementById('propertiesGrid');
    const resultsCount = document.getElementById('resultsCount');
    const searchCriteria = document.getElementById('searchCriteria');

    resultsCount.textContent = `${headerText} (${properties.length} found)`;
    if (criteria && Object.keys(criteria).length > 0) {
        searchCriteria.style.display = 'block';
        searchCriteria.innerHTML = `<strong>Search criteria:</strong> ${formatCriteria(criteria)}`;
    } else {
        searchCriteria.style.display = 'none';
    }

    markers.forEach(marker => marker.setMap(null));
    markers = [];
    grid.style.display = 'grid';

    if (properties.length === 0) {
        grid.innerHTML = '<div class="no-results" style="grid-column: 1/-1;"><h3>No Properties Found</h3><p>Try adjusting your search criteria</p></div>';
        return;
    }

    grid.innerHTML = properties.map(property => `
        <div class="property-card" onclick="selectProperty(${property.id})">
            <img src="${property.image}" alt="Property" class="property-image" onerror="this.src='https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'">
            <div class="property-content">
                <div class="property-price">$${property.price.toLocaleString()}/month</div>
                <div class="property-address">${property.address}</div>
                <div class="property-specs">
                    <span>🛏️ ${property.bedrooms} bed${property.bedrooms !== 1 ? 's' : ''}</span>
                    <span>🚿 ${property.bathrooms} bath${property.bathrooms !== 1 ? 's' : ''}</span>
                    <span>📐 ${property.sqft} sqft</span>
                </div>
                <span class="property-type">${property.type}</span>
                ${property.amenities && property.amenities.length > 0 ? `
                    <div class="amenities">
                        ${property.amenities.slice(0, 3).map(a => `<span class="amenity-tag">${a}</span>`).join('')}
                        ${property.amenities.length > 3 ? `<span class="amenity-tag">+${property.amenities.length - 3} more</span>` : ''}
                    </div>` : ''}
            </div>
        </div>
    `).join('');

    const bounds = new google.maps.LatLngBounds();
    properties.forEach(property => {
        const marker = new google.maps.Marker({
            position: { lat: property.lat, lng: property.lng },
            map: map,
            title: property.address,
            icon: { url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png', scaledSize: new google.maps.Size(45, 45) }
        });
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 15px; max-width: 300px;">
                    <h3 style="margin: 0 0 10px 0; color: #667eea;">$${property.price.toLocaleString()}/month</h3>
                    <p style="margin: 0 0 10px 0; color: #666;">${property.address}</p>
                    <div style="display: flex; gap: 15px; font-size: 14px;">
                        <span>🛏️ ${property.bedrooms} bed${property.bedrooms !== 1 ? 's' : ''}</span>
                        <span>🚿 ${property.bathrooms} bath${property.bathrooms !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            `
        });
        marker.addListener('click', () => {
            selectProperty(property.id);
            infoWindow.open(map, marker);
        });
        markers.push(marker);
        bounds.extend(marker.getPosition());
    });
    if (properties.length > 0) map.fitBounds(bounds);
}

// Select property
function selectProperty(propertyId) {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;
    currentProperty = property;
    const detailPanel = document.getElementById('detailPanel');
    const propertiesGrid = document.getElementById('propertiesGrid');

    detailPanel.innerHTML = `
        <button class="back-button" onclick="closeDetailPanel()">
            <span style="font-size: 18px;">←</span> Back to Results
        </button>
        <div class="detail-image-container">
            <img src="${property.image}" alt="${property.address}" class="detail-image" onerror="this.src='https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'">
        </div>
        <div class="detail-info">
            <div class="detail-price">$${property.price.toLocaleString()}/month</div>
            <div class="detail-address">${property.address}</div>
            <div class="detail-specs-grid">
                <div class="spec-item">
                    <div class="spec-icon">🛏️</div>
                    <div class="spec-text">
                        <span class="spec-label">Bedrooms</span>
                        <span class="spec-value">${property.bedrooms}</span>
                    </div>
                </div>
                <div class="spec-item">
                    <div class="spec-icon">🚿</div>
                    <div class="spec-text">
                        <span class="spec-label">Bathrooms</span>
                        <span class="spec-value">${property.bathrooms}</span>
                    </div>
                </div>
                <div class="spec-item">
                    <div class="spec-icon">📐</div>
                    <div class="spec-text">
                        <span class="spec-label">Square Feet</span>
                        <span class="spec-value">${property.sqft}</span>
                    </div>
                </div>
                <div class="spec-item">
                    <div class="spec-icon">🏠</div>
                    <div class="spec-text">
                        <span class="spec-label">Property Type</span>
                        <span class="spec-value">${property.type}</span>
                    </div>
                </div>
            </div>
            ${property.amenities && property.amenities.length > 0 ? `
                <div class="detail-amenities">
                    <h3>Amenities</h3>
                    <div class="amenities-grid">
                        ${property.amenities.map(amenity => `<div class="amenity-item">✓ ${amenity}</div>`).join('')}
                    </div>
                </div>` : ''}
            ${property.roommate && property.roommate.lookingForRoommate ? `
                <div style="margin-top: 20px; padding: 20px; background: #f0f9ff; border-radius: 10px;">
                    <h3 style="color: #0284c7; margin-bottom: 10px;">🏠 Roommate Wanted</h3>
                    <p style="color: #666;">Looking for ${property.roommate.roommateCount} roommate(s)</p>
                    <p style="color: #666;">Rent per person: $${property.roommate.monthlyRent}/month</p>
                    ${property.roommate.moveInDate ? `<p style="color: #666;">Move-in: ${new Date(property.roommate.moveInDate).toLocaleDateString()}</p>` : ''}
                    ${property.roommate.preferences ? `<p style="color: #666; margin-top: 10px;">${property.roommate.preferences}</p>` : ''}
                </div>` : ''}
            ${property.contact ? `
                <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <h3 style="margin-bottom: 10px;">Contact Information</h3>
                    ${property.contact.email ? `<p>📧 Email: <a href="mailto:${property.contact.email}">${property.contact.email}</a></p>` : ''}
                    ${property.contact.phone ? `<p>📱 Phone: <a href="tel:${property.contact.phone}">${property.contact.phone}</a></p>` : ''}
                </div>` : ''}
        </div>
    `;
    propertiesGrid.style.display = 'none';
    detailPanel.classList.add('active');
    map.setCenter({ lat: property.lat, lng: property.lng });
    map.setZoom(15);
}

// Close detail panel
function closeDetailPanel() {
    const detailPanel = document.getElementById('detailPanel');
    const propertiesGrid = document.getElementById('propertiesGrid');
    detailPanel.classList.remove('active');
    propertiesGrid.style.display = 'grid';
    currentProperty = null;
    if (properties.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(marker => bounds.extend(marker.getPosition()));
        map.fitBounds(bounds);
    }
}

// Format search criteria for display
function formatCriteria(criteria) {
    const parts = [];
    if (criteria.minPrice || criteria.maxPrice) {
        if (criteria.minPrice && criteria.maxPrice) parts.push(`$${criteria.minPrice}-$${criteria.maxPrice}/month`);
        else if (criteria.minPrice) parts.push(`$${criteria.minPrice}+/month`);
        else if (criteria.maxPrice) parts.push(`up to $${criteria.maxPrice}/month`);
    }
    if (criteria.minBedrooms || criteria.maxBedrooms) {
        if (criteria.minBedrooms && criteria.maxBedrooms) parts.push(`${criteria.minBedrooms}-${criteria.maxBedrooms} bedrooms`);
        else if (criteria.minBedrooms) parts.push(`${criteria.minBedrooms}+ bedrooms`);
        else if (criteria.maxBedrooms) parts.push(`up to ${criteria.maxBedrooms} bedrooms`);
    }
    if (criteria.propertyTypes && criteria.propertyTypes.length > 0) parts.push(criteria.propertyTypes.join(', '));
    if (criteria.requiredAmenities && criteria.requiredAmenities.length > 0) parts.push(`with ${criteria.requiredAmenities.join(', ')}`);
    if (criteria.minSqft || criteria.maxSqft) {
        if (criteria.minSqft && criteria.maxSqft) parts.push(`${criteria.minSqft}-${criteria.maxSqft} sqft`);
        else if (criteria.minSqft) parts.push(`${criteria.minSqft}+ sqft`);
        else if (criteria.maxSqft) parts.push(`up to ${criteria.maxSqft} sqft`);
    }
    return parts.join(' • ');
}

// Search properties
async function searchProperties() {
    const input = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const query = input.value.trim();
    if (!query) { loadAllProperties(); return; }
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';
    showLoading();
    closeDetailPanel();
    try {
        const response = await fetch(`${API_URL}/api/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userPrompt: query })
        });
        const data = await response.json();
        if (data.error) {
            showError(`Error: ${data.message}. Make sure ANTHROPIC_API_KEY is set.`);
        } else {
            const headerText = data.properties.length > 0 ? `Search results for "${query}"` : 'No properties found';
            displayProperties(data.properties, headerText, data.criteria);
        }
    } catch (error) {
        showError('Failed to connect to server. Make sure it\'s running on port 3000.');
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search';
    }
}

// Loading state
function showLoading() {
    const grid = document.getElementById('propertiesGrid');
    grid.style.display = 'grid';
    grid.innerHTML = '<div class="loading" style="grid-column: 1/-1;"><div class="spinner"></div><p>Searching properties...</p></div>';
}

// Error state
function showError(message) {
    const grid = document.getElementById('propertiesGrid');
    grid.style.display = 'grid';
    grid.innerHTML = `<div class="no-results" style="grid-column: 1/-1;"><h3>⚠️ Error</h3><p>${message}</p></div>`;
}

// Handle enter key for search
function handleKeyPress(event) {
    if (event.key === 'Enter') searchProperties();
}

// Search nearby places
function searchNearbyPlaces() {
    const searchBox = document.getElementById('placesSearchBox');
    const searchBtn = document.getElementById('placesSearchBtn');
    const query = searchBox.value.trim();

    if (!query) {
        return;
    }

    // Disable button during search
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';

    // Get center point for search - selected property or map center
    let center;
    if (currentProperty) {
        center = { lat: currentProperty.lat, lng: currentProperty.lng };
    } else if (markers.length > 0) {
        // Use center of all property markers
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(marker => bounds.extend(marker.getPosition()));
        center = bounds.getCenter();
    } else {
        // Default to Waterloo
        center = { lat: 43.4723, lng: -80.5449 };
    }

    clearPlaces();

    // Use textSearch for flexible keyword search
    const request = {
        location: center,
        radius: 2000, // 2km radius
        query: query
    };

    placesService.textSearch(request, (results, status) => {
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search';

        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            results.forEach(place => createPlaceMarker(place));
            // Change button to "Clear"
            searchBtn.textContent = 'Clear Places';
            searchBtn.onclick = clearPlacesAndReset;
            console.log(`Found ${results.length} places for "${query}"`);
        } else {
            alert(`No places found for "${query}". Try different keywords like "pizza", "coffee", or "gym".`);
        }
    });
}

// Handle enter key for places search
function handlePlacesKeyPress(event) {
    if (event.key === 'Enter') {
        searchNearbyPlaces();
    }
}

// Create place marker
function createPlaceMarker(place) {
    const marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name,
        icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', scaledSize: new google.maps.Size(40, 40) }
    });
    const infowindow = new google.maps.InfoWindow({
        content: `<div style="padding: 10px;"><h3 style="margin: 0 0 5px 0; font-size: 16px;">${place.name}</h3><p style="margin: 0; font-size: 13px; color: #666;">${place.vicinity}</p>${place.rating ? `<p style="margin: 5px 0 0 0; font-size: 13px;">⭐ ${place.rating} / 5</p>` : ''}</div>`
    });
    marker.addListener('click', () => infowindow.open(map, marker));
    placeMarkers.push(marker);
}

// Clear places
function clearPlaces() {
    placeMarkers.forEach(marker => marker.setMap(null));
    placeMarkers = [];
}

// Clear places and reset button
function clearPlacesAndReset() {
    clearPlaces();
    const searchBox = document.getElementById('placesSearchBox');
    const searchBtn = document.getElementById('placesSearchBtn');
    searchBox.value = '';
    searchBtn.textContent = 'Search';
    searchBtn.onclick = searchNearbyPlaces;
}

// Open post property modal
function openPostModal() {
    document.getElementById('postModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    setTimeout(() => initAutocomplete(), 100);
}

// Close post property modal
function closePostModal() {
    document.getElementById('postModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('postPropertyForm').reset();
    document.getElementById('successMessage').style.display = 'none';
}

// Handle modal clicks outside
window.onclick = function (event) {
    const modal = document.getElementById('postModal');
    if (event.target === modal) closePostModal();
}

// Toggle roommate fields
function toggleRoommateFields() {
    const select = document.getElementById('lookingForRoommate');
    const fields = document.getElementById('roommateFields');
    if (select.value === 'yes') fields.classList.add('visible');
    else fields.classList.remove('visible');
}

// Submit property
async function submitProperty(event) {
    event.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';
    const formData = {
        address: document.getElementById('address').value,
        price: parseInt(document.getElementById('price').value),
        propertyType: document.getElementById('propertyType').value,
        bedrooms: parseInt(document.getElementById('bedrooms').value),
        bathrooms: parseFloat(document.getElementById('bathrooms').value),
        sqft: parseInt(document.getElementById('sqft').value),
        latitude: parseFloat(document.getElementById('latitude').value),
        longitude: parseFloat(document.getElementById('longitude').value),
        imageUrl: document.getElementById('imageUrl').value || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
        amenities: document.getElementById('amenities').value.split(',').map(a => a.trim()).filter(a => a.length > 0),
        roommate: {
            lookingForRoommate: document.getElementById('lookingForRoommate').value === 'yes',
            roommateCount: parseInt(document.getElementById('roommateCount').value) || 0,
            monthlyRent: parseInt(document.getElementById('monthlyRent').value) || 0,
            moveInDate: document.getElementById('moveInDate').value,
            preferences: document.getElementById('roommatePreferences').value,
            description: document.getElementById('description').value
        },
        contact: {
            email: document.getElementById('contactEmail').value,
            phone: document.getElementById('contactPhone').value
        }
    };
    try {
        const response = await fetch(`${API_URL}/api/properties`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (response.ok) {
            document.getElementById('successMessage').style.display = 'block';
            document.getElementById('postPropertyForm').reset();
            setTimeout(() => { loadAllProperties(); closePostModal(); }, 2000);
        } else {
            alert('Error posting property: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        alert('Failed to post property. Make sure the server is running.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post Property';
    }
}

// Initialize autocomplete for address field
function initAutocomplete() {
    const input = document.getElementById('address');
    if (!input) return;
    const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ['address'],
        componentRestrictions: { country: 'ca' }
    });
    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
            document.getElementById('latitude').value = place.geometry.location.lat().toFixed(6);
            document.getElementById('longitude').value = place.geometry.location.lng().toFixed(6);
            document.getElementById('address').value = place.formatted_address;
        }
    });
}

// Make initMap available globally
window.initMap = initMap;
