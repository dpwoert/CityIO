/*
var imgTime = 'night';  // day / night
var imgType = 'car';    // car / train 
var imgOutput = 'json'; //Choose an output. image, json, pjson, html
var imgSize = 10; // The width/height of the image. If you want 10x10px use 10. If you want 1x1px use 1. 
var distanceInMeters = 1;   // Distance between x1, y1 and the x2, y2 coordinates. Use 1 for 1 meter, 2 for 2 meters, 10 for 10 meters. 1000 = 1km. 

tiles = {
        minDB: 49,
        maxDB: 75
};

tiles.getTile= function(pos){
        //rijksdriehoekcoordinaten (bron: http://spatialreference.org/ref/epsg/28992/)
        var RDC = '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel ' +
                                '+towgs84=565.237,50.0087,465.658,-0.406857,0.350733,-1.87035,4.0812 +units=m +no_defs'
    var RDCpos = proj4(RDC, [ pos[0],pos[1] ]);
}

tiles.readSound = function(point, img, url, db, id){
        // Geen idee wat hier. In ieder geval de kleurcombinaties:
        // car/train day
        // HEX / RGB | dB
        // #330033 / rgb(51, 0, 51) = 75+
        // #C031C7 / rgb(192, 49, 199) = 70-74
        // #FF0000 / rgb(255, 0, 0) = 65-69
        // #F88017 / rgb(248, 128, 23) = 60-64
        // #FFFF00 / rgb(255, 255, 0) = 55-59


        // car/train night
        // HEX / RGB | dB
        // #5E767E / rgb(94, 118, 126) = 70+
        // #C48793 / rgb(196, 135, 147) = 65-69
        // #C11B17 / rgb(193, 27, 23) = 60-64
        // #E56717 / rgb(229, 103, 23) = 55-59
        // #EDDA74 / rgb(237, 218, 116) = 50-54
}


tiles.getSound = function(pos, db, id){

        if(imgTime === 'day' && imgType === 'car'){
                map = 1;
        } else if(imgTime === 'day' && imgType === 'train'){
                map = 4;
        } else if(imgTime === 'night' && imgType === 'car'){
                map = 2;
        } else if(imgTime === 'night' && imgType === 'train'){
                map = 5;
        } else {
                console.log('Error imgTime/Type');
        };

        var tile = tiles.getTile(pos);
        
        $.getJSON('http://geoproxy.s-hertogenbosch.nl/PWArcGIS1/rest/services/externvrij/Geluidbelasting/MapServer/export?bbox='
                    +parseInt(RDCpos[0])+'%2C'+parseInt(RDCpos[1])+'%2C'+(parseInt(RDCpos[0])+distanceInMeters)+'%2C'+(parseInt(RDCpos[1])+distanceInMeters)
                    +'&bboxSR=28992&layers=show%3A'+map+'+&layerdefs=&size='+imgSize+'%2C'+imgSize+'&imageSR=28992&format=png8'
                    +'&transparent=true&dpi=96&time=&layerTimeOptions=&f=json', function(urlProvider) {
            console.log(urlProvider.href);
            var imageUrlProvider = urlProvider.href;
        });
        
        var cachePath = parseInt(RDCpos[0]) + '-' + parseInt(RDCpos[1]) + '.png';

        //get file from web
        var getfile = function(){

                //get from web so prepare connection
                url = url.parse(urlProvider);
                var options = { 
                        host: url.hostname, port: 80, path: url.pathname,
                        headers: { "connection": "keep-alive", "Referer": "http://geoproxy.s-hertogenbosch.nl/PWArcGIS1/rest/services/externvrij/Geluidbelasting/MapServer/"}
                };

                //get from the interwebz
                var request = http.get(options, function(res){
                        var imagedata = '';
                        res.setEncoding('binary');
                        console.log('get url ' + urlProvider);

                        //received more data
                        res.on('data', function(chunk){
                                imagedata += chunk;
                        })

                        //image completed
                        res.on('end', function(){

                                if(imagedata.indexOf('error')>0){
                                        console.log('FAILED - error at their host | trying again');
                                        tiles.getSound(pos, db, id);
                                } else {
                                        //save to cache file
                                        fs.writeFile(cachePath, imagedata, 'binary', function(err){
                                                if (err) console.log('err');
                                                console.log('load from url');
                                                tiles.readHeight(tile.point, imagedata, urlProvider, db, id);
                                        });
                                }
                        })
                });
        };

        //check if in cache
        fs.readFile(cachePath, "binary", function(err, file) {  
                if(err) {
                        getfile();
                } else {
                        tiles.readSound(tile.point, file, urlProvider, db, id);
                }
        });
};

tiles.saveSound = function(pos, db, id){
        tiles.getSound(pos, db, id)
};
*/
