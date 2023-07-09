//URLs for fetching data --------------------------------------
const geoURL = 'https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326'
const chartURL = 'https://statfin.stat.fi:443/PxWeb/api/v1/fi/StatFin/evaa/statfin_evaa_pxt_13sw.px'
//-------------------------------------------------------------
//Body JSON Query ---------------------------------------------
const jsonQuery = {
    "query": [
      {
        "code": "Vuosi",
        "selection": {
          "filter": "item",
          "values": [
            "2023"
          ]
        }
      },
      {
        "code": "Sukupuoli",
        "selection": {
          "filter": "item",
          "values": [
            "SSS"
          ]
        }
      },
      {
        "code": "Puolue",
        "selection": {
          "filter": "item",
          "values": [
            "03",
            "02",
            "01",
            "04",
            "05",
            "06",
            "07",
            "08",
            "09"
          ]
        }
      },
      {
        "code": "Vaalipiiri ja kunta vaalivuonna",
        "selection": {
          "filter": "item",
          "values": [
            "SSS"
          ]
        }
      },
      {
        "code": "Tiedot",
        "selection": {
          "filter": "item",
          "values": [
            "evaa_aanet"
          ]
        }
      }
    ],
    "response": {
      "format": "json-stat2"
    }
}
//-------------------------------------------------------------

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

//Method for creating features for the map
const getFeature = (feature, layer) => {
    const id = feature.id
    if (!id) return;
    layer.bindTooltip(feature.properties.nimi)
}
//method for building the chart.
const buildChart = async (body) => {
    const data = await fetchChartData(chartURL, body)
    console.log(data)

    const year = Object.values(data.dimension.Vuosi.category.label)[0]
    const area = Object.values(data.dimension["Vaalipiiri ja kunta vaalivuonna"].category.label)[0]
    const parties = Object.values(data.dimension.Puolue.category.label)
    const values = data.value

    const dataArray = [{name: area, values: values}]
    console.log(values)

    const chartData = {
        labels: parties,
        datasets: dataArray
    }

    const chart = new frappe.Chart("#chart", {
        title: area + " (" + year + "):",
        data: chartData,
        type: 'bar',
    })
}

//Fetching methods:
const fetchData = async (url) => {
    const dataPromise = await fetch(url)
    const dataJSON = await dataPromise.json()
    //console.log(dataJSON)
    return dataJSON
}

const fetchChartData = async (url, body) => {
    const dataPromise = await fetch(url, {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify(body)
    })
    if (!dataPromise.ok)    {
        return;
    }
    const dataJSON = await dataPromise.json()
    return dataJSON
}

//Initialitzation calls
initMap()
buildChart(jsonQuery)