//HTML Elements-------------------------------------------------
const dropDownMenu1 = document.getElementById("municipality-list1")
const dropDownMenu2 = document.getElementById("municipality-list2")
const pageBtn = document.getElementById("change-page")
const dropArea1 = document.getElementById("drop-area1")
const dropArea2 = document.getElementById("drop-area2")
//--------------------------------------------------------------
//URLs for fetching data ---------------------------------------
const chartURL = 'https://statfin.stat.fi:443/PxWeb/api/v1/fi/StatFin/evaa/statfin_evaa_pxt_13sw.px'
const geoURL = 'https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326'
//--------------------------------------------------------------
//JSON Query bodies --------------------------------------------
const updateJsonQuery = (areaId, year) => {
    const jsonQuery = {
        "query": [
        {
            "code": "Vuosi",
            "selection": {
                "filter": "item",
                "values": [
                    year
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
//--------------------------------------------------------------

// Page change listener
pageBtn.addEventListener("click", () => {
    window.location.href = "index.html"
})

//Initializes the drop-down menu with all the municipalities of Finland
const initDropDownMenu = async () => {
    const data = await fetchData(geoURL)
    const areaList = data.features
    //console.log(data)

    areaList.forEach((area) => {
        const option1 = document.createElement('option')
        const option2 = document.createElement('option')
        option1.innerHTML = area.properties.nimi
        option2.innerHTML = area.properties.nimi
        dropDownMenu1.appendChild(option1)
        dropDownMenu2.appendChild(option2)
    })
}

//Updates chart data automatically when draged year is dropped to the grey box.
dropArea1.addEventListener('drop', async () => {
    const yearLabel1 = document.getElementById("year-label1")
    await updateChart(dropDownMenu1, "#chart1", yearLabel1.innerText)
})

dropArea2.addEventListener('drop', async () => {
    const yearLabel2 = document.getElementById("year-label2")
    await updateChart(dropDownMenu2, "#chart2", yearLabel2.innerText)
})

//Updates chart data automatically when the municipality changes in the drop-down menu.
dropDownMenu1.addEventListener('change', async () => {
    const yearLabel1 = document.getElementById("year-label1")
    await updateChart(dropDownMenu1, "#chart1", yearLabel1.innerText)
})

dropDownMenu2.addEventListener('change', async () => {
    const yearLabel2 = document.getElementById("year-label2")
    await updateChart(dropDownMenu2, "#chart2", yearLabel2.innerText)
})

//Gets new data and builds new chart
const updateChart = async (dropDownMenu, chartID, year) => {
    const name = dropDownMenu.value
    let id

    const data = await fetchData(geoURL)
    const areaList = data.features

    areaList.forEach((area) => {
        if (area.properties.nimi === name)  {
            id = area.properties.kunta
        }
    })
    buildChart(id, chartID, year)
}

//Builds new pie chart 
const buildChart = async (id, chartID, yearID) => {
    const data = await fetchData(chartURL)
    const valueTexts = data.variables[3].valueTexts
    const values = data.variables[3].values

    for (let i = 0; i < valueTexts.length; i++) {
        let ID = values[i]
        let res = valueTexts[i].slice(2, 5)
        if (res == id)  {
            let data = await fetchChartData(chartURL, updateJsonQuery(ID, yearID))
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

            const chart = new frappe.Chart(chartID, {
                title: area + ":",
                data: chartData,
                type: 'pie',
                height: 650,
                colors: ['#006288', '#ffde55', '#f54b4b', '#349a2b', '#61bf1a', '#f00a64', '#ffdd93', '#0135a5'],
            })
            break
        }
    };
}

//Fetch methods:
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
    initDropDownMenu()
    buildChart('005', "#chart1", "2023")
    buildChart('005', "#chart2", "2023")
}

start()
