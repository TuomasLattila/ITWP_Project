
//URLs for fetching data --------------------------------------
const geoURL = 'https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326'
// ------------------------------------------------------------

//Initializing the map with borders of different municipalities in Finland.
const initMap = async () => {
    let map = L.map('map', {
        minZoom: -3
    })

    let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "@ OpenStreetMap"
    }).addTo(map)

    let geoJson = L.geoJSON(await fetchData(geoURL), {
        weight: 2,
        onEachFeature: getFeature
    }).addTo(map)

    map.fitBounds(geoJson.getBounds())
}

const getFeature = (feature, layer) => {
    const id = feature.id
    if (!id) return;
    layer.bindTooltip(feature.properties.nimi)
}

//Fetching method.
const fetchData = async (url) => {
    const dataPromise = await fetch(url)
    const dataJSON = await dataPromise.json()
    console.log(dataJSON)
    return dataJSON
}

//Initialitzation call
initMap()