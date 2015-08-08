///////////////////////////////////////////////////////////////////////////////
// loadgpx.js
//
// Lectura de fichero gpx,para cargar con el API de ArcGIS
// 
// Fichero de origen loadgpx.4.js
// Copyright (C) 2006 Kaz Okuda (http://notions.okuda.ca)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// If you use this script or have any questions please leave a comment
// at http://notions.okuda.ca/geotagging/projects-im-working-on/gpx-viewer/
// A link to the GPL license can also be found there.
//
// Modificado por Carlos Guerrero López
///////////////////////////////////////////////////////////////////////////////
//
// History:
//    revision 1 - Initial implementation
//    revision 2 - Removed LoadGPXFileIntoGoogleMap and made it the callers
//                 responsibility.  Added more options (colour, width, delta).
//    revision 3 - Waypoint parsing now compatible with Firefox.
//    revision 4 - Upgraded to Google Maps API version 2.  Tried changing the way
//               that the map calculated the way the center and zoom level, but
//               GMAP API 2 requires that you center and zoom the map first.
//               I have left the bounding box calculations commented out in case
//               they might come in handy in the future.
//
//    5/28/2010 - Upgraded to Google Maps API v3 and refactored the file a bit.
//                          (Chris Peplin)
//    116/05/2014 -revision 5: - Eliminadas funciones no usadas
//
// Autor origial: Kaz Okuda original
// URI: http://notions.okuda.ca/geotagging/projects-im-working-on/gpx-viewer/
//
// Autor de la actualización: Carlos Guerrero López
// URI: http://www.carlosguerrerolopez.com
// Actualizado por Carlos Guerrero para que funcione con el API JavaScript de ArcGIS 
// 
//
///////////////////////////////////////////////////////////////////////////////

function GPXParser(xmlDoc, map) {
    this.xmlDoc = xmlDoc;
}

GPXParser.prototype.addTrackSegmentToMap = function(trackSegment, colour,width) {
    require(["esri/geometry/Point",
        "esri/geometry/Polyline",
        "esri/symbols/SimpleLineSymbol",
        "esri/graphic","esri/Color",
        "esri/SpatialReference",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/geometry/geodesicUtils",
        "esri/units"],
    function(Point,
        Polyline,
        SimpleLineSymbol,
        Graphic,
        Color,
        SpatialReference,
        SimpleMarkerSymbol,
        geodesicUtils,
        Units) {  
            //Comprobamos si el gpx tiene coordenadas
            var trackpoints = trackSegment.getElementsByTagName("trkpt");
            if(trackpoints.length == 0) {
                return;
            }

            //Array donde almacenamos los puntos para despues generar la polyline
            var pointarray = [];
            //Obtenemos la hora de comienzo del video
            var dtComienzo =new Date(trackpoints[0].children[1].textContent);
            //Variable donde almacenamos el tiempo de cada punto
            var horaPunto;
            //Variable que usaremos para saber los segundos que hay entre cada punto
            var auxTiempo=dtComienzo;
            //Guardamos el punto anterior de cada pasada
            var puntoAnterior;
            //Variable que almacen al diferencia de hora entre los puntos
            var diferenciaHora;
            //Variables para el grafico
            var yMin=999999999,yMax=0;
            //Varible donde almacenamos la velocidad
            var vel=0;

            var datosGraph =[{
                key : "Elevación" , 
                values:[]
            }];
            //datosGraph[0].values.push([]);
            //Recorremos todos los puntos
            for(var i = 0; i < trackpoints.length; i++) {
                //Obtenemos las coordenadas de los puntos del gpx
                var lon = parseFloat(trackpoints[i].getAttribute("lon"));
                var lat = parseFloat(trackpoints[i].getAttribute("lat"));
                //Creamos un objeto punto con esas coordenadas
                latlng = new Point(lon,lat);
                //Lo agregamos al array para crear la linea a pintar
                pointarray.push(latlng);
                //Obtenemos la hora del punto actual
                var dt2 = new Date(trackpoints[i].children[1].textContent);
                
                //Restamos la hora actual a la anterior
                horas=Math.floor((dt2-auxTiempo)/1000);

                //Almacenamos la hora actual
                auxTiempo=dt2;

                //Agregamos el punto anterior al array de segundos para poder seguir el video
                //Y agregamos la posicion del gpx para cada segundo
                for(var j = 1; j < horas; j++) {
                    arraySegundos.push(puntoAnterior);
                    arrayElevacion.push(i);
                    arrayVelocidades.push(vel);
                }
                //Agregamos el punto actual al array
                arraySegundos.push(latlng);

                //Agregamos la posicion del gpx al array de elevacion
                arrayElevacion.push(i);

                //Obtenemos la elevacion del punto actual
                var ele = trackpoints[i].children[0].textContent;

                diferenciaHora= dt2-dtComienzo;
                //Agregamos el elemento al objeto para crear el perfil
                datosGraph[0].values.push({x:diferenciaHora,y: parseInt(ele),puntEnMapa:latlng,segundos:arraySegundos.length});
                //Guardamos el minimo y total
                if(parseInt(ele)<yMin) yMin=parseInt(ele);
                if(parseInt(ele)>yMax) yMax=parseInt(ele);

                
                //almacenamos en el array cada posicion del eje X del grafico
                arrayElevacionSec.push(diferenciaHora);

                //Creamos un objeto punto que no se va a ver para poder pinchar sobre la linea y posicionarnos
                // en ese segundo del video
                var sms = new SimpleMarkerSymbol();
                sms.setColor(new esri.Color([0,0,255,0.0]))
                sms.setOutline(null);
                var segundoEnVideo=Math.floor((dt2-dtComienzo)/1000);
                var graphic = new Graphic(latlng, sms,{hora:segundoEnVideo});
                lgisCapaVerticesGPX.add(graphic);


                //Calculamos la velocidad actual
                if (puntoAnterior!=undefined) {
                    var polylineVel =  new Polyline(new SpatialReference({wkid:4326}));
                    polylineVel.addPath([puntoAnterior,latlng]);
                    var longitud = geodesicUtils.geodesicLengths([polylineVel], Units.KILOMETERS);
                    vel=longitud/(horas/60/60);
                    vel=Math.round(vel * 100) / 100
                    arrayVelocidades.push(vel);
                    console.log(vel);
                }

                //Almacenamos el punto actual
                puntoAnterior=latlng;

            }
              
            // Por ultimo agregamos todos los puntos a la linea y la dibujamos
            var polyline =  new Polyline(new SpatialReference({wkid:4326}));
            polyline.addPath(pointarray);
            var sls = new SimpleLineSymbol();
            sls.setColor(new esri.Color([255,0,0]))
            var graphic = new Graphic(polyline, sls);
            map.graphics.add(graphic);

             //crearPerfil
            fCrearPerfil(datosGraph,yMin,yMax);

            fCrearGaugeVelocidades();
            //Obtenemos la distancia total del recorrigo
            var lengths = geodesicUtils.geodesicLengths([polyline], Units.METERS);
           

    });
}

GPXParser.prototype.addTrackToMap = function(track, colour, width) {
       var segments = track.getElementsByTagName("trkseg");
        for(var i = 0; i < segments.length; i++) {
            var segmentlatlngbounds = this.addTrackSegmentToMap(segments[i], colour,
                    width);
        }

}

GPXParser.prototype.centerAndZoom = function(trackSegment) {
    require([
        "esri/map","esri/geometry/Extent"], 
        function(Map,Extent) {
            var pointlist = new Array("trkpt", "wpt");
            var minlat = 0;
            var maxlat = 0;
            var minlon = 0;
            var maxlon = 0;

            for(var pointtype = 0; pointtype < pointlist.length; pointtype++) {

                // Center the map and zoom on the given segment.
                var trackpoints = trackSegment.getElementsByTagName(
                        pointlist[pointtype]);

                // If the min and max are uninitialized then initialize them.
                if((trackpoints.length > 0) && (minlat == maxlat) && (minlat == 0)) {
                    minlat = parseFloat(trackpoints[0].getAttribute("lat"));
                    maxlat = parseFloat(trackpoints[0].getAttribute("lat"));
                    minlon = parseFloat(trackpoints[0].getAttribute("lon"));
                    maxlon = parseFloat(trackpoints[0].getAttribute("lon"));
                }

                for(var i = 0; i < trackpoints.length; i++) {
                    var lon = parseFloat(trackpoints[i].getAttribute("lon"));
                    var lat = parseFloat(trackpoints[i].getAttribute("lat"));

                    if(lon < minlon) minlon = lon;
                    if(lon > maxlon) maxlon = lon;
                    if(lat < minlat) minlat = lat;
                    if(lat > maxlat) maxlat = lat;
                }
            }

            if((minlat == maxlat) && (minlat == 0)) {
                map.centerAt(new Point( -122.942333,49.327667));
                return;
            }

            // Center around the middle of the points
            var centerlon = (maxlon + minlon) / 2;
            var centerlat = (maxlat + minlat) / 2;

            var extent = new esri.geometry.Extent({
                "xmin":minlon,"ymin":minlat,"xmax":maxlon,"ymax":maxlat,
                "spatialReference":{"wkid":4326}
              });
            map.setExtent(extent);

           

    });
}



GPXParser.prototype.addTrackpointsToMap = function() {

    var tracks = this.xmlDoc.documentElement.getElementsByTagName("trk");
    for(var i = 0; i < tracks.length; i++) {
        this.addTrackToMap(tracks[i], this.trackcolour, this.trackwidth);
    }
}


function fCrearPerfil(dataD3,yMin,yMax){
    $('#chart').highcharts({
        chart: {
            type: 'area',
            //Propiedad usada para el zoom
            zoomType: 'x'
        },
        title: {
                text: 'Perfíl de elevación de la ruta'
        },
            subtitle: {
                text: '<a href="https://twitter.com/@Carlos_cgl003">by @Carlos_cgl003</a>'
        },
        series: [{
            data: dataD3[0].values,
            name: "Altura de la ruta"
        }],
        yAxis: {
            title: {
                text: 'Altitud en metros'
            },
            labels: {
                formatter: function() {
                    return this.value;
                }
            },
                max:yMax+1,
                min:yMin-1
        },
        xAxis: {
            //Propiedad usada para el zoom
            minRange: 5,
            type: 'datetime',
            dateTimeLabelFormats: {
                second: '%M:%S',
            },
            title: {
                enabled: true,
                text: 'Tiempo de carrera',
                style: {
                    fontWeight: 'normal'
                }
            },
            labels: {
                formatter: function() {
                    return "Min:" + new Date(this.value).getUTCMinutes();
                }
            }
            
             
        },
         tooltip: {
            formatter: function() {
                var date=new Date(this.x);
                var sec= date.getUTCSeconds();
                if(String(sec).length==1){
                    sec="0" + sec;
                }
                return "<b>" +this.y + '</b> metros en el min: <b>'+ date.getUTCMinutes() + ":" + sec+ "</b>" ;
            },

        },
        plotOptions: {
            area: {
                stacking: 'normal',
                lineColor: '#666666',
                lineWidth: 2,
                marker: {
                    enabled:true,
                    fillColor:"rgba(0,0,0,0)",
                    states:{
                        hover:{
                            enabled:true,
                            fillColor: "#FFFF00"
                        },
                        select:{
                            enabled:true,
                            fillColor: "#FF0000"
                        }
                    }
                },
                events: {
                    mouseOut: function() {
                        lgisCapaChart.clear();
                    }
                }

            },
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            var segundo=this.options.segundos;
                            //lanzamos 
                            player.playVideo();
                            if(player.getPlayerState()==-1 ||
                                player.getPlayerState()==3 ||
                                player.getPlayerState()==5){
                                
                                var millisecondsToWait = 1000;
                                setTimeout(function() {
                                    player.seekTo(segundo+parseInt(segundoComienzo));
                                }, millisecondsToWait);
                        }else{
                            player.seekTo(segundo+parseInt(segundoComienzo));
                        }
                        },
                         mouseOver: function() {
                            var punto=this.options.puntEnMapa;
                            require(["esri/geometry/Point",
                                "esri/geometry/Polyline",
                                "esri/symbols/SimpleLineSymbol",
                                "esri/graphic","esri/Color",
                                "esri/SpatialReference",
                                "esri/symbols/SimpleMarkerSymbol",
                                "esri/symbols/PictureMarkerSymbol"],
                            function(Point,
                                Polyline,
                                SimpleLineSymbol,
                                Graphic,
                                Color,
                                SpatialReference,
                                SimpleMarkerSymbol,
                                PictureMarkerSymbol) { 
                                    //Limpiamos la capa temporal donde aparece el punto del mapa
                                    lgisCapaChart.clear();
                                    //Creamos el nuevo punto con la imagen
                                    var pictureMarkerSymbol = new PictureMarkerSymbol('images/pin.png', 15, 20);
                                    pictureMarkerSymbol.xoffset=0;
                                    pictureMarkerSymbol.yoffset=10;
                                    //agregamos el grafico creado al mapa
                                    var graphic = new Graphic(punto, pictureMarkerSymbol);  
                                    lgisCapaChart.add(graphic);
                            });
                        }
                    }
                }
            }
        }
    });
}
function fCrearGaugeVelocidades(){

    $('#gaugeVel').highcharts({
    
        chart: {
            type: 'gauge',
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false
        },
        
        title: {
            text: 'Velocidad Actual'
        },
        
        pane: {
            startAngle: -150,
            endAngle: 150,
            background: [{
                backgroundColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, '#FFF'],
                        [1, '#333']
                    ]
                },
                borderWidth: 0,
                outerRadius: '109%'
            }, {
                backgroundColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, '#333'],
                        [1, '#FFF']
                    ]
                },
                borderWidth: 1,
                outerRadius: '107%'
            }, {
                // default background
            }, {
                backgroundColor: '#DDD',
                borderWidth: 0,
                outerRadius: '105%',
                innerRadius: '103%'
            }]
        },
           
        // the value axis
        yAxis: {
            min: 0,
            max: 50,
            
            minorTickInterval: 'auto',
            minorTickWidth: 1,
            minorTickLength: 10,
            minorTickPosition: 'inside',
            minorTickColor: '#666',
    
            tickPixelInterval: 30,
            tickWidth: 2,
            tickPosition: 'inside',
            tickLength: 10,
            tickColor: '#666',
            labels: {
                step: 2,
                rotation: 'auto'
            },
            title: {
                text: 'km/h'
            },
            plotBands: [{
                from: 0,
                to: 17,
                color: '#55BF3B' // green
            }, {
                from: 17,
                to: 34,
                color: '#DDDF0D' // yellow
            }, {
                from: 34,
                to: 50,
                color: '#DF5353' // red
            }]        
        },

    
        series: [{
            name: 'Velocidad',
            data: [0],
            tooltip: {
                valueSuffix: ' km/h'
            }
        }]
    
    });
}

