let map;
let markers = [];

function findHelp(type) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            showPosition(position, type);
        });
    } else {
        alert("Geolocation not supported");
    }
}

function showPosition(position, type) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    // Initialize map only once
    if (!map) {
        map = L.map('map').setView([lat, lon], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);

        L.marker([lat, lon]).addTo(map)
            .bindPopup("You are here")
            .openPopup();
    }

    // Clear old markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    fetchNearby(lat, lon, type);
}

function fetchNearby(lat, lon, type) {
    let query = "";

    if (type === "hospital") {
        query = `node["amenity"="hospital"](around:3000,${lat},${lon});`;
    } 
    else if (type === "police") {
        query = `node["amenity"="police"](around:3000,${lat},${lon});`;
    } 
    else if (type === "pharmacy") {
        query = `
        node["amenity"="pharmacy"](around:3000,${lat},${lon});
        node["shop"="pharmacy"](around:3000,${lat},${lon});
        `;
    }

    let url = `https://overpass-api.de/api/interpreter?data=
    [out:json];
    (${query});
    out;`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.elements.length === 0) {
                alert("No nearby " + type + " found");
            }

            data.elements.forEach(place => {
                let marker = L.marker([place.lat, place.lon])
                    .addTo(map)
                    .bindPopup(type.toUpperCase());

                markers.push(marker);
            });
        });
}

