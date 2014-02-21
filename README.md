# City I/O
City I/O creates an unique 3D visualization of the city [‘s-Hertogenbosch, the Netherlands](http://www.openstreetmap.org/#map=12/51.7012/5.3304).

Our goal is to create a platform with multiple cities, each with their own unique visualisation based on their data sources.

## Input
Multiple data sources are used to create the 3D city. 

* [Cadastral map](http://www.kadaster.nl/bag)
* [Height map](http://ahn.geodan.nl/ahn/)
* [Postal Codes](http://www.nlextract.nl)
* [Noise Pollution Data](http://geoproxy.s-hertogenbosch.nl/apps2/geoportal_geluid.html)
* [Particulate Matter Data](http://www.nsl-monitoring.nl/viewer/)
* [OpenStreetMap](http://wiki.openstreetmap.org/wiki/Main_Page)

## Output
City I/O creates a generative 3D data visualization of the city ‘s-Hertogenbosch, showing possible nuisances of different kind of emissions. The color of the buildings are based on the particulate matter data. The lines floating above the streets represent the noise pollution.

![City I/O Screenshot 1](http://s28.postimg.org/qmydkk8m5/gh1.png)
![City I/O Screenshot 2](http://s28.postimg.org/5rc39bcf1/gh2.png)

## Technique
City I/O is fully build in JavaScript (server and client side). The follwing techniques and libaries are used:
* [Node.js](http://nodejs.org/)
* [npm](https://www.npmjs.org/)
* [Meteor](https://www.meteor.com/) 
* [Meteorite](https://github.com/oortcloud/meteorite)
* [Underscore.js](http://underscorejs.org/)
* [Three.js](http://www.threejs.org) (WebGL rendering)
* [D3.js](http://d3js.org/)
* [MongoDB](http://www.mongodb.org/)
* [LESS](http://lesscss.org/) (CSS Precompiler)

## Browser Support
The latest versions of the following browsers are supported:
* Google Chrome (Mac/Windows)
* Firefox (Mac/Windows)
* Opera (Mac/Windows)

## Copyright
© Davey van der Woert, Jesse van Rheenen, Yannick Diezenberg
