var map = L.map('map').setView([70.3, 70.3], 4);

var positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
        attribution: '©OpenStreetMap, ©CartoDB'
})
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });

//var esri_satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    //attribution: '©Esri'});

//var yandex_maps = L.tileLayer('https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}&scale=1&lang=ru_RU', {
  //attribution: '©YandexMaps'});

//var yandex_satellite = L.tileLayer('https://core-sat.maps.yandex.net/tiles?l=sat&v=3.1025.0&x={x}&y={y}&z={z}&scale=1&lang=ru_RU', {
    //attribution: '@YandexSatellite'});
    positron.addTo(map);

async function getData() {
    var municipalities = await fetch('./geojson/municipalitie.geojson').then(response => response.json());
    var cultural_heritage = await fetch('./geojson/cultural_heritage.geojson').then(response => response.json());
    var field_area = await fetch('./geojson/field.geojson').then(response => response.json());
    var protected_areas = await fetch('./geojson/protected_areas.geojson').then(response => response.json());
    var oil_pipeline = await fetch('./geojson/oil_pipeline.geojson').then(response => response.json());
    var gas_pipeline = await fetch('./geojson/gas_pipeline.geojson').then(response => response.json());
    var region_field = await fetch('./geojson/region_field.geojson').then(response => response.json());
    var landslide_kharasaway = await fetch('./geojson/landslide_kharasaway.geojson').then(response => response.json());


    var datasets = [ municipalities,cultural_heritage, field_area, protected_areas, oil_pipeline, gas_pipeline, region_field, landslide_kharasaway]
    return datasets
}
function buildAttributeTable(properties, fieldsMap) {
    let html = '<table class="popup-table">';
    for (const field in fieldsMap) {
        html += `
            <tr>
                <th>${fieldsMap[field]}</th>
                <td>${properties[field] ?? '—'}</td>
            </tr>
        `;
    }
    html += '</table>';
    return html;
}
getData().then(([municipalities,cultural_heritage, field_area, protected_areas,oil_pipeline, gas_pipeline, region_field, landslide_kharasaway]) => {

    const fieldTypeColors = {
        gas: '#73c9c9ff',
        oil: '#2f1702ff',
        gas_and_oil: '#14228aff',
        gas_condensate: '#0ff19aff',
        oil_and_gas: '#570710ff',
        oil_gas_condensate: '#6b4417ff',
    };

    function getFieldColor(type) {
        return fieldTypeColors[type] || '#7f8c8d';
    }

    const protectedTypeColors = {
        "Национальный парк": '#184506ff',
        "Памятник природы": '#4e6958ff',
        "Природный заказник": '#1c422fff',
        "Природный заповедник": '#15fea5ff',
        "Природный парк": '#c0f0baff'
    };

    function getProtectedColor(type) {
        return protectedTypeColors [type] || '#7f8c8d';
    }
    
    const regionfieldTypeColors = {
        Oil: '#afafafff',
        Gas: '#c3e3e6ff'
    };

    function getRegionFieldColor(type) {
        return regionfieldTypeColors[type] || '#7f8c8d';
    }


    const scale = chroma.scale(['red', 'blue']).domain([2008, 2023]);
    var landslide_kharasaway_layer = L.geoJSON(landslide_kharasaway, {
        style: function(feature) {
            const year = Number(feature.properties.year);
            console.log('Year:', year);
            return {
                fillColor: scale(year).hex(),
                fillOpacity: 0.7,
                weight: 1,
                color: '#333'
            };
        },
        interactive: true
        }).addTo(map)



        var municipalities_layer = L.geoJSON(municipalities,
            {
                style: {
                    fillColor: '#516267ff',
                    fillOpacity: 0.05,
                    weight: 0.5,
                    opacity: 1,
                    color: '#1b2025ff',
                },
                onEachFeature: function (feature, layer) {
                    const html = buildAttributeTable(feature.properties, {
                        name: 'Муниципалитет',
                    label: 'Кадастровый номер'});
                        layer.bindPopup(html);},
                        interactive: true
            }
        ).addTo(map)

        var cultural_heritage_layer = L.geoJSON(cultural_heritage,
            {
                style: {
                    fillColor: '#a65af1ff',
                    fillOpacity: 0.2,
                    weight: 0.3,
                    opacity: 1,
                    color: '#7a38bdff',
                },
                interactive: false
            }
        ).addTo(map)

        var field_area_layer = L.geoJSON(field_area,
            {
                style: function (feature) {
                    const color = getFieldColor(feature.properties.TYPE);
                    return {
                        fillColor: color,
                        color: color,
                        fillOpacity: 0.3,
                        opacity: 0.6,  
                        weight: 0.6
                    };
                },
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(`
                        <b>Тип:</b> ${feature.properties.TYPE1}
                        `);
                        },
                        interactive: true
                        }).addTo(map)

        var protected_areas_layer = L.geoJSON(protected_areas,
            {
                style: function (feature) {
                    const color = getProtectedColor(feature.properties.TYPE2);
                    return {
                        fillColor: color,
                        color: color,
                        fillOpacity: 0.3,
                        opacity: 0.6,  
                        weight: 0.6
                    };
                },
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(`
                        <b>Тип:</b> ${feature.properties.TYPE2}
                        `);
                        },
                        interactive: true
                        }).addTo(map)
        
        var region_field_layer = L.geoJSON(region_field,
            {
                style: function (feature) {
                    const color = getRegionFieldColor(feature.properties.O_G);
                    return {
                        fillColor: color,
                        color: color,
                        fillOpacity: 0.3,
                        opacity: 0.6,  
                        weight: 0.6
                    };
                },
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(`
                        <b>Тип:</b> ${feature.properties.O_G}
                        `);
                        },
                        interactive: true
                        }).addTo(map)

        var oil_pipeline_layer = L.geoJSON(oil_pipeline,
            {
                style: {
                    weight: 0.5,
                    opacity: 1,
                    color: '#03121fff',
                    dashArray: '1, 1' 
                },
                interactive: false
            }
        ).addTo(map)

        var gas_pipeline_layer = L.geoJSON(gas_pipeline,
            {
                style: {
                    weight: 0.5,
                    opacity: 1,
                    color: '#007CE5',
                    dashArray: '1, 1' 
                },
                interactive: false
            }
        ).addTo(map)


        

        var vector_layers = {
            "Муниципальные образования": municipalities_layer, 
            "Территории объектов культурного наследия" : cultural_heritage_layer,
            "Границы залежей": field_area_layer, 
            "ООПТ" : protected_areas_layer,
            "Нефтепровод": oil_pipeline_layer,
            "Газопровод" : gas_pipeline_layer,
            "Оползни Харасавэй" : landslide_kharasaway_layer,
            "Провинции" : region_field_layer
        };

        var basemaps = {
            "Серая подложка": positron,
            "OSM": osm,
           // "ESRI": esri_satellite,
           // "YandexMaps": yandex_maps,
           // "YandexSatellite": yandex_satellite
        };

        
    var baseMapsControl = L.control.layers(basemaps, null, { collapsed: true }).addTo(map);
    var laysControl = L.control.layers(null, vector_layers, { collapsed: true }).addTo(map);

        var legend = L.control({ position: 'bottomright' });

        legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend')
            var grades = [0, 1000000, 10000000, 25000000, 50000000, 100000000, 300000000, 1000000000]

            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    `<i style="background: ${getColor(grades[i] + 1)}"></i>${grades[i]}${grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+'}`;
            }

            return div;
        };

        legend.addTo(map);

        map.attributionControl.addAttribution('&copy; Natural Earth');
    }
)
