const dropDownMenu = document.getElementById("municipality-list")
const submitBtn = document.getElementById("submit-data")

//URLs for fetching data --------------------------------------
const geoURL = 'https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326'
const chartURL = 'https://statfin.stat.fi:443/PxWeb/api/v1/fi/StatFin/evaa/statfin_evaa_pxt_13sw.px'
//-------------------------------------------------------------
//Body JSON Query ---------------------------------------------
const updateJsonQuery = (areaId) => {
    const jsonQuery = {
        "query": [
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
                areaId
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
    return jsonQuery
}    
//-------------------------------------------------------
const initDropDownMenu = async () => {
    const data = await fetchData(geoURL)
    const areaList = data.features
    //console.log(data)

    areaList.forEach((area) => {
        const option = document.createElement('option')
        option.innerHTML = area.properties.nimi
        dropDownMenu.appendChild(option)
    })
}

// submitBtn.addEventListener("click", async () => {
//     const name = dropDownMenu.value
//     //console.log(name)

//     const data = await fetchData(geoURL)
//     const areaList = data.features

//     areaList.forEach((area) => {
//         if (area.properties.nimi === name)  {
//             //buildChart2(area.properties.kunta)
//         }
//     })

// })

//Initializing the map with borders of different municipalities in Finland.
const initMap = async () => {
    let map = L.map('map', {
        minZoom: -3
    })

    let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "@ OpenStreetMap"
    }).addTo(map)

    let google = L.tileLayer("https://{s}.google.com/vt/lyrs=s@221097413,traffic&x={x}&y={y}&z={z}", {
      maxZoom: 20,
      minZoom: 2,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map)

    let geoJson = L.geoJSON(await fetchData(geoURL), {
        weight: 2,
        fillColor: '#3480eb',
        onEachFeature: getFeature
    }).addTo(map)

    let baseMaps = {
      "OpenStreetMap": osm,
      "Google satellite": google
    }

    L.control.layers(baseMaps).addTo(map)

    map.fitBounds(geoJson.getBounds())
}

var lastLayer

//Method for creating features for the map
const getFeature = (feature, layer) => {
    const id = feature.properties.kunta
    //console.log(id)
    if (!id) return;
    layer.bindTooltip(feature.properties.nimi)
    layer.addEventListener('click', () => {
        if(lastLayer != undefined)  {
            lastLayer.setStyle({
                fillColor: '#3480eb',
                fillOpacity: 0.2
            })
        }
        lastLayer = layer
        layer.setStyle({
            fillColor: 'red',
            fillOpacity: 0.5
        })
        buildChart2(id)
    })
}

//method for building the chart.
const buildChart = async (body) => {
    const data = await fetchChartData(chartURL, body)
    //console.log(data)

    const year = Object.values(data.dimension.Vuosi.category.label).reverse()[0]
    const area = Object.values(data.dimension["Vaalipiiri ja kunta vaalivuonna"].category.label)[0]
    const parties = Object.values(data.dimension.Puolue.category.label)
    const values = data.value.reverse()
    // console.log(values)
    array = []
    for (let i = 0; i < 9; i++) {
        array.push(values[i])
    }
    // console.log(array)

    const dataArray = [{name: area, values: array.reverse()}]
    //console.log(values)

    const chartData = {
        labels: parties,
        datasets: dataArray
    }

    const chart = new frappe.Chart("#chart", {
        title: area + " (" + year + "):",
        data: chartData,
        type: 'bar',
        height: 350,
    })
}

const buildChart2 = async (id) => {
    const data = await fetchData(chartURL)
    //console.log(data)
    const valueTexts = data.variables[3].valueTexts
    const values = data.variables[3].values
    //console.log(valueTexts)
    //console.log(values)

    for (let i = 0; i < valueTexts.length; i++) {
        let ID = values[i]
        let res = valueTexts[i].slice(2, 5)
        //console.log(res)
        if (res == id)  {
            let data = await fetchChartData(chartURL, updateJsonQuery(ID))
            //console.log(data)
            const labels = Object.values(data.dimension.Vuosi.category.label)
            const area = Object.values(data.dimension["Vaalipiiri ja kunta vaalivuonna"].category.label)[0]
            const parties = Object.values(data.dimension.Puolue.category.label)
            const values = data.value

            parties.forEach((party, index) => {
                let array = []
                for (let i = 0; i < 11; i++)    {
                    array.push(values[i * 9 + index])
                }
                parties[index] = {
                    name: party,
                    values: array
                }
            })

            // parties.forEach((party) => {
            //     console.log(party.values)
            // })

            const chartData = {
                labels: labels,
                datasets: parties
            }

            const chart = new frappe.Chart("#chart2", {
                title: area + ":",
                data: chartData,
                type: 'line',
                height: 400,
                colors: ['#006288', '#ffde55', '#f54b4b', '#349a2b', '#61bf1a', '#f00a64', '#ffdd93', '#0135a5'],
                lineOptions: {
                    hideDots: 1,
                }
            })
        }
    };
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
initDropDownMenu()
initMap()
buildChart(updateJsonQuery("SSS"))