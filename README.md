# Documentation

## Made by:
Tuomas Lättilä

## Overall description of the project:
This project's idea is a data portal where you can reviewe the results of parliament elections in Finland. The main page holds a map of Finland and four different charts with different data on them. The map has layers of all the municipalities in Finland and when user hovers on top of the layers, it will show the name of the municipality. The map is also zoomable and has a street view and a satelite view options.

The main page charts hold data about resent election's result, election history, population and employment rate. Three out of four chart's data can be changed to data from one specific municipality by clicking the desired municipality on the map. The chart that holds recent election result data is static. All the charts have a possibility to be downloaded in a png format by clicking the "Lataa"-button.

There is also a second page which holds a list of different election years from 1983 to 2023 and two different pie charts. The charts both have a drop-down menu initialized with all the municipalities of Finland. This page is suppose to be used to compare two different municipalities election results from the desired year. The way this page functions is that you can choose the specific year by draging it to the grey box (on top of both charts) and you can also choose the specific municipality from the drop-down menu. The pie charts will update the election result data automatically when either of the events occurs. 

Both of the pages are made responsive so that the page looks good and can be used on any screen size. 

## Pictures of both pages:
- Main page:
![Kuvakaappaus 2023-07-31 17-31-06](https://github.com/TuomasLattila/ITWP_Project/assets/120785942/6418e2b7-e2ea-494b-a510-58bb9193b3ba)

- Second page:
![Kuvakaappaus 2023-07-31 17-31-29](https://github.com/TuomasLattila/ITWP_Project/assets/120785942/511c4142-e4cf-4628-bd6a-347b50b9145c)


## Tools used in this project:
- Leaflet (map) Link: https://leafletjs.com/
- Frappe-charts (charts) Link: https://frappe.io/charts
- html2canvas (PNG-image) Link: https://github.com/niklasvh/html2canvas
  
## Used data:
- Map:
  - "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  - "https://{s}.google.com/vt/lyrs=s@221097413,traffic&x={x}&y={y}&z={z}"
- Municipalities:
  - https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326
- Election data:
  - https://statfin.stat.fi:443/PxWeb/api/v1/fi/StatFin/evaa/statfin_evaa_pxt_13sw.px
- Population and employment rate:
  - https://pxdata.stat.fi:443/PxWeb/api/v1/fi/Kuntien_avainluvut/2021/kuntien_avainluvut_2021_aikasarja.px

## Grade suggestion:
Features implemented:
- Well written report: (2/2)
- Application is responsive and can be used on both desktop and mobile environment: (4/4)
- Application works on Firefox, Safari, Edge and Chrome: (2/2)
- Drag’n’drop new data to charts/maps: (4/4)
- The application show relevant data on a map and user has change to change the data: (1/3)
- The application show relevant data on a chart and user has chance to change the data: (3/3)
- User is able to switch between different layers of data on map: (0/2)
- By clicking the map user has an option to get to additional charts covering that area: (4/4)
- There are more than two items of data available: (4/4)
- Able to download the visualization as a PNG (or SVG) image: (2/2)
- My own features:
  - Second page: (2p)

Total points: 28p
