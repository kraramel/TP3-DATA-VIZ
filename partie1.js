var width = 700, height = 580;

data = "https://lyondataviz.github.io/teaching/lyon1-m2/2021/data/covid-06-11-2021.csv"
departement_francais = "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson"

var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);


var g = svg.append("g");

var projection = d3.geoConicConformal().center([2.454071, 46.279229]).scale(2800);

// On définit l’échelle de couleur
var color = d3.scaleQuantize()
    .range(["#edf8e9","#bae4b3","#74c476","#31a354","#006d2c"]);

var path = d3.geoPath().projection(projection);

var tooltip = d3.select('body').append('div')
    .attr('class', 'hidden tooltip');

var jourChoisi = "2021-09-12"

d3.csv(data).then(function(data) {
        
        var cleanData = data.filter( function (el) {
            return el.sexe == "0"          
          });
       

        color.domain([
            d3.min(cleanData, function(d) { 
                return d.hosp;  
            }),
            d3.max(cleanData, function(d) {
                return d.hosp; 
            })
        ]);


        d3.json(departement_francais).then(function(json) {
                //  console.log(cleanData)
                //  console.log(json.features)

            for (var i = 0; i < cleanData.length; i++) {
                
                var dataJour = cleanData[i].jour

                var dataDepartement = cleanData[i].dep;

                var dataHosp = parseInt(cleanData[i].hosp);
                
                for (var j = 0; j < json.features.length; j++) {
                    var jsonDep = json.features[j].properties.code;
                    if (dataDepartement == jsonDep && dataJour == jourChoisi) {
                         
                        json.features[j].properties.value = dataHosp;
                       
                        //Pas besoin de chercher plus loin
                        break;
                    }
                }
            }


            g.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("fill", function(d) {
                    //on prend la valeur recuperee plus haut
                    var value = d.properties.value;

                    if (value) {
                        return color(value);
                    } else {
                        // si pas de valeur alors en gris
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
        });
    });