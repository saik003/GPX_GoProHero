#GPX GO Pro Hero JavaScript ArcGIS

Este ejemplo sincroniza un video capturado con una camara deportiva **Go Pro Hero**  y un **GPX** capturado con la aplicación **Runtastic**. Con esto podemos ver como ha transcurrido la ruta y lo que hemos visto en cada punto de ella.Podemos usar los controles del video **(API Youtube)** para posicionarnos en el punto del video que deseemos y automaticamente nos mostrará la posicion del mapa mas cercana a ese segundo. Tambien podemos hacer click sobre un punto de la ruta sobre el mapa y automaticamente el video se posicionará en el segundo mas cercano a esa coordenada.
La sincronizacion del punto en el mapa se realiza cada 2 segundos, este parametro se puede modificar.

Podemos usarlo con cualquier video y con cualquier GPX , el GPX en la demostración esta renombrado a .xml.

Como mejoras se podria aplicar que el usuario pudiar seleccionar un video de youtube subido anteriormente y que cargue el GPX que tiene el local para poder realizarlo con sus datos.

APIS Usadas:

**ArcGIS JavaScript 3.9**

**Api Youtube HTML5**

**HighCharts**

**jQuery 1.11.0**

###Actualización
Ahora el icono es un pictureMarkerSymbol que modifica su ángulo en base a los vértices de la línea.
###23-06-2014
Añadido gráfico con el perfil topográfico de la ruta realizada. Este gráfico esta sincronizado con la ruta y el video, si hacemos clic sobre una parte del gráfico automaticamente nos posiciona en esa parte del video y viceversa.
Añadido gráfico que muestra la velocidad actual de la ruta. 
###Ejemplos
[Ver demostración](http://saik003.github.io/GPX_GoProHero/).

[Aquí](https://github.com/saik003/Apps-JavaScript/tree/master/GPX_GoProHero) el código para descargar.  

###Versiones del API de ESRI soportadas
Probado en versiones: 3.9

Todos los derechos reservados.

