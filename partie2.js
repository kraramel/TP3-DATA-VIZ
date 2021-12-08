var width = 700, height = 580;

data = "https://lyondataviz.github.io/teaching/lyon1-m2/2021/data/covid-06-11-2021.csv"
departement_francais = "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson"

var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// On rajoute un groupe englobant toute la visualisation pour plus tard
var g = svg.append("g");

var projection = d3.geoConicConformal().center([2.454071, 46.279229]).scale(2800);

// On définit l’échelle de couleur
var color = d3.scaleQuantize()
    .range(["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"]);

var path = d3.geoPath().projection(projection);

var tooltip = d3.select('body').append('div')
    .attr('class', 'hidden tooltip');

daysArray = []
daysArraySet = false

// Partie 2
d3.csv(data).then(function (data) {
// console.log(data)

    var cleanData = data.filter(function (el) {
        return el.sexe == "0"
    });

    color.domain([
        d3.min(cleanData, function (d) {
            return d.hosp;
        }),
        d3.max(cleanData, function (d) {
            return d.hosp;
        })
    ]);

    d3.json(departement_francais).then(function (json) {
        if (daysArraySet == false) {

            for (let index = 0; index < cleanData.length; index++) {
                if (parseInt(cleanData[index].dep) == 1) {
                    daysArray.push(cleanData[index].jour)
                }
            }

            d3.select('#day').html(daysArray[0]);
            d3.select('#slider').attr("max", daysArray.length - 1);

            daysArraySet = true
        }

        d3.select("#slider").on("input", function () {
            updateViz(this.value);
        });

        function updateViz(value) {
            d3.select('#day').html(daysArray[value]);
            drawMap(daysArray[value]);
        }

        function drawMap(jour) {
            carte = svg.selectAll("path")
                .data(json.features);

            for (var i = 0; i < cleanData.length; i++) {

                var dataJour = cleanData[i].jour

                var dataDepartement = cleanData[i].dep;

                var dataHosp = parseInt(cleanData[i].hosp);

                //Recherche de l'etat dans le GeoJSON
                for (var j = 0; j < json.features.length; j++) {
                    var jsonDep = json.features[j].properties.code;
                    if (dataDepartement == jsonDep && dataJour == jour) {
                        //On injecte la valeur de l'Etat dans le json
                        json.features[j].properties.value = dataHosp;

                        //Pas besoin de chercher plus loin
                        break;
                    }
                }
            }


            carte.attr("class", "update")
                .style("fill", function (d) {
                    var value = d.properties.value;

                    if (value) {
                        return color(value);
                    } else {
                        return "#ccc";
                    }
                })

            carte.enter()
                .append("path")
                .attr("class", "enter")
                .attr("d", path)
                .style("fill", function (d) {
                    var value = d.properties.value;

                    if (value) {
                        return color(value);
                    } else {
                        return "#ccc";
                    }
                })
                .on('mousemove', function (e, d) {
                    // on recupere la position de la souris, 
                    // e est l'object event d
                    var mousePosition = [e.x, e.y];
                    // console.log(mousePosition);
                    // on affiche le toolip
                    tooltip.classed('hidden', false)
                        // on positionne le tooltip en fonction 
                        // de la position de la souris
                        .attr('style', 'left:' + (mousePosition[0] + 15) +
                            'px; top:' + (mousePosition[1] - 35) + 'px')
                        // on recupere le nom de l'etat 
                        .html(d.properties.nom);
                })
                .on('mouseout', function () {
                    // on cache le toolip
                    tooltip.classed('hidden', true);
                });
        }
        // console.log(daysArray[0])
        drawMap(daysArray[0])
    });
});