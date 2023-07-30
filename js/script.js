//HTML Elements-------------------------------------------------
const pageBtn = document.getElementById("change-page")
const expBtn1 = document.getElementById("expChart1")
const expBtn2 = document.getElementById("expChart2")
const expBtn3 = document.getElementById("expChart3")
const expBtn4 = document.getElementById("expChart4")
//--------------------------------------------------------------
//URLs for fetching data ---------------------------------------
const geoURL = 'https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326'
const chartURL1 = 'https://statfin.stat.fi:443/PxWeb/api/v1/fi/StatFin/evaa/statfin_evaa_pxt_13sw.px'
const chartURL2 = 'https://pxdata.stat.fi:443/PxWeb/api/v1/fi/Kuntien_avainluvut/2021/kuntien_avainluvut_2021_aikasarja.px'
//--------------------------------------------------------------
//JSON Query bodies --------------------------------------------
const updateJsonQuery1 = (areaId) => {
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

const updateJsonQuery2 = (areaId) => {
    const jsonQuery = {
        "query": [
          {
            "code": "Alue 2021",
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
                "M411",
                "M140"
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

let LAST_LAYER //global variable for the last municipality that was clicked

//Page change button listener
pageBtn.addEventListener("click", async () => {
    window.location.href="page2.html"
})

//Listeners for the export buttons:
expBtn1.addEventListener('click', () => {
    convertDownloadChart("elction_result(2023)", "chart")
})

expBtn2.addEventListener('click', () => {
    convertDownloadChart("election_history", "chart2")
})

expBtn3.addEventListener('click', () => {
    convertDownloadChart("population", "chart3")
})

expBtn4.addEventListener('click', () => {
    convertDownloadChart("employment_rate", "chart4")
})

//Method for converting html element to canvas and downloading it as PNG
const convertDownloadChart = (name, chartID) => {
    html2canvas(document.getElementById(chartID)).then((canvas) => {
        const imgURL = canvas.toDataURL("image/png")
        const link = document.createElement('a')
        link.href = imgURL
        link.download = name + ".png"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    })
}

//Initializing the map with layers of different municipalities in Finland.
const initMap = async () => {
    let map = L.map('map', {
        minZoom: 5,
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
        onEachFeature: getFeature,
    }).addTo(map)

    let baseMaps = {
      "OpenStreetMap": osm,
      "Google satellite": google
    }
    //Adding boundaries to the map
    let sW = L.latLng(59.8089, 20.5563)
    let nE = L.latLng(70.0924, 31.5869)
    let bounds = L.latLngBounds(sW, nE)
    map.setMaxBounds(bounds)

    L.control.layers(baseMaps).addTo(map)

    map.fitBounds(geoJson.getBounds())
}

//Method for creating features for the map
const getFeature = (feature, layer) => {
    const id = feature.properties.kunta
    if (!id) return;
    layer.bindTooltip(feature.properties.nimi)
    layer.addEventListener('click', () => {
        if(LAST_LAYER != undefined)  {
            LAST_LAYER.setStyle({
                fillColor: '#3480eb',
                fillOpacity: 0.2
            })
        }
        layer.setStyle({
            fillColor: 'red',
            fillOpacity: 0.5
        })
        LAST_LAYER = layer
        buildChart2(id)
        buildChart3(id)
    })
}

//method for building chart (#chart) for the data of latest election result (2023).
const buildChart1 = async (body) => {
    const data = await fetchChartData(chartURL1, body)
    const year = Object.values(data.dimension.Vuosi.category.label).reverse()[0]
    const area = Object.values(data.dimension["Vaalipiiri ja kunta vaalivuonna"].category.label)[0]
    const parties = Object.values(data.dimension.Puolue.category.label)
    const values = data.value.reverse()
    
    array = []
    for (let i = 0; i < 9; i++) {
        array.push(values[i])
    }

    const dataArray = [{name: area, values: array.reverse()}]

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

//method for building chart (#chart2) for the data of election results in a clicked municipality (1983-2023).
const buildChart2 = async (id) => {
    const data = await fetchData(chartURL1)
    const valueTexts = data.variables[3].valueTexts
    const values = data.variables[3].values

    for (let i = 0; i < valueTexts.length; i++) {
        let ID = values[i]
        let res = valueTexts[i].slice(2, 5)
    
        if (res == id)  {
            let data = await fetchChartData(chartURL1, updateJsonQuery1(ID))
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

            const chartData = {
                labels: labels,
                datasets: parties
            }

            const chart = new frappe.Chart("#chart2", {
                title: area + ":",
                data: chartData,
                type: 'line',
                colors: ['#006288', '#ffde55', '#f54b4b', '#349a2b', '#61bf1a', '#f00a64', '#ffdd93', '#0135a5'],
                lineOptions: {
                    hideDots: 1,
                }
            })
            break
        }
    };
}

//method for building charts (#chart3 & #chart4) for the data of population and employment rate (1987-2021).
const buildChart3 = async (id) => {
    const data = await fetchChartData(chartURL2, updateJsonQuery2(id))
    const values = data.value
    const labels = Object.values(data.dimension.Vuosi.category.label)
    const area = Object.values(data.dimension["Alue 2021"].category.label)[0]

    let populations = []
    let employments = []
    let years = []
    values.forEach((value, index) => {
        if (index < 35) {
            if (index % 2 == 0) {
                populations.push(value)
            }
        }
        else {
            if (index % 2 != 0) {
                employments.push(value)
            }
        }
    })
    labels.forEach((label, index) => {
        if (index % 2 == 0) {
            years.push(label)
        }
    })

    const dataArray1 = [{name: area, values: populations}]
    const dataArray2 = [{name: area, values: employments}]

    const chartData1 = {
        labels: years,
        datasets: dataArray1
    }
    const chartData2 = {
        labels: years,
        datasets: dataArray2
    }

    const chart1 = new frappe.Chart("#chart3", {
        title: area+":",
        data: chartData1,
        type: 'line',
        colors: ['#0000FF'],
        lineOptions: {
            regionFill: 1,
            hideDots: 1,
        }
    })

    const chart2 = new frappe.Chart("#chart4", {
        title: area+":",
        data: chartData2,
        type: 'line',
        colors: ['#0000FF'],
        lineOptions: {
            regionFill: 1,
            hideDots: 1,
        }
    })
}

//Fetching methods:
const fetchData = async (url) => {
    try {
        const dataPromise = await fetch(url)
        const dataJSON = await dataPromise.json()
        return dataJSON
    }
    catch (error) {
        console.log(error)
    }
}

const fetchChartData = async (url, body) => {
    try {
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
    catch (error) {
        console.log(error)
    }
}

//Initialitzation calls
const start = () => {
    initMap()
    buildChart1(updateJsonQuery1("SSS"))
    buildChart2("ko ")
    buildChart3("SSS")
}

start()