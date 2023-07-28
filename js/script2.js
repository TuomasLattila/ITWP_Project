const dropDownMenu1 = document.getElementById("municipality-list1")
const dropDownMenu2 = document.getElementById("municipality-list2")
const compareBtn = document.getElementById("compare-button")
const pageBtn = document.getElementById("change-page")
const header = document.getElementById("header")
const chartURL = 'https://statfin.stat.fi:443/PxWeb/api/v1/fi/StatFin/evaa/statfin_evaa_pxt_13sw.px'
const geoURL = 'https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326'

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

pageBtn.addEventListener("click", () => {
    window.location.href = "index.html"
})

compareBtn.addEventListener('click', async () => {
    const name1 = dropDownMenu1.value
    const name2 = dropDownMenu2.value
    let id1
    let id2

    const data = await fetchData(geoURL)
    const areaList = data.features

    areaList.forEach((area) => {
        if (area.properties.nimi === name1)  {
            id1 = area.properties.kunta
        }
        if (area.properties.nimi === name2)  {
            id2 = area.properties.kunta
        }
    })
    buildChart(id1, "#chart1")
    buildChart(id2, "#chart2")
})

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

const buildChart = async (id, chartID) => {
    const data = await fetchData(chartURL)
    //console.log(data)
    const valueTexts = data.variables[3].valueTexts
    const values = data.variables[3].values
    //console.log(valueTexts)
    //console.log(values)

    for (let i = 0; i < valueTexts.length; i++) {
        let ID = values[i]
        //console.log(ID)
        let res = valueTexts[i].slice(2, 5)
        //console.log(res)
        if (res == id)  {
            let data = await fetchChartData(chartURL, updateJsonQuery(ID))
            //console.log(data)
            const year = Object.values(data.dimension.Vuosi.category.label).reverse()[0]
            const area = Object.values(data.dimension["Vaalipiiri ja kunta vaalivuonna"].category.label)[0]
            const parties = Object.values(data.dimension.Puolue.category.label)
            const values = data.value.reverse()
            //console.log(values)
            header.innerText = "Vuosi: "+year

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
                height: 800,
                colors: ['#006288', '#ffde55', '#f54b4b', '#349a2b', '#61bf1a', '#f00a64', '#ffdd93', '#0135a5'],
            })
            break
        }
    };
}

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

initDropDownMenu()
buildChart('405', "#chart1")
buildChart('091', "#chart2")

