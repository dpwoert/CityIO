var THREE = require('three');
var q = require('q-xhr')(window.XMLHttpRequest, require('q'));

module.exports = function(url){

    var type, data, projection, boundingBox;

    var isLoaded = false;

    this.setBoundingBox = function(min, max){

    	//set boundingbox in geo coordinates
    	boundingBox = {
    		'min': min,
    		'max': max
    	};

    	//chainable
    	return this;

    };

    this.getBoundingBox = function(){

    	//get projection coordinates
    	var boundingBox2D, boundingBox3D;
    	if(projection instanceof IO.classes.Projection && boundingBox){

    		var pointMin = projection.translate(boundingBox.min[0], boundingBox.min[1]);
    		var pointMax = projection.translate(boundingBox.max[0], boundingBox.max[1]);

    		//2D
    		boundingBox2D = {};
    		boundingBox2D.min = { x: pointMin[0], y: pointMin[1] };
    		boundingBox2D.max = { x: pointMax[0], y: pointMax[1] };

    		//3D
    		boundingBox3D = {};
    		boundingBox3D.min = new THREE.Vector3(pointMin[0], pointMin[1], 0);
    		boundingBox3D.max = new THREE.Vector3(pointMax[0], pointMax[1], 0);
    	}

    	return {
    		boxGeo: boundingBox,
    		box2D: boundingBox2D,
    		box3D: boundingBox3D
    	};

    };

    this.load = function(){

    	//create promise
    	var self = this;
    	var defer = $q.defer();

    	//get file extention
    	var ext = url.split('.');
    	ext = ext[ext.length-1];

    	//serve from cache
    	if(isLoaded){
    		defer.resolve(self);
    	}

    	else if(ext === 'png' || ext === 'jpg'){

    		//get texture
    		data = THREE.ImageUtils.loadTexture(url);
    		type = 'image';

    		//resolve (chainable)
    		defer.resolve(self);

    	}

    	//request data from server
    	else {

    		q.xhr
    			.get(url,{
    				cache: false
    			})
    			.success(function(geoData){

    				type = geoData.features ? 'geoJSON' : 'geoGrid';

    				//save in object
    				data = geoData;

    				//resolve (chainable)
    				defer.resolve(self);

    				//load change
    				isLoaded = true;

    			})
    			.error(function(){
    				console.error('error retrieving map data');
    			});

    		return defer.promise;

    	}

    };

    this.setProjection = function(newProjection){

    	if(newProjection instanceof IO.classes.Projection){
    		projection = newProjection;
    	} else {
    		console.warn('projection not loaded properly');
    	}

    	//chainable
    	return this;
    };

    this.topoJSON = function(key){
    	if (data.type && data.type === 'Topology') {
    		data = topojson.feature(data, data.objects);
    		// data = topojson.feature(data, data.objects[key]);
    		type = 'geoJSON';
    	}
    	return this;
    };

    this.geoJSON = function(){

    	//data is already in geoJSON form
    	return data;

    };

    var loadFeature = function(coordinates, z, polygon){

    	var path = [];

    	//polygon fix
    	if(polygon){
    		coordinates = coordinates[0];
    	}

    	//loop through coordinates
    	coordinates.forEach(function(coordinate){

    		//check for junk
    		if(coordinate[0] !== 0 && coordinate[1] !== 0){

    			var v2 = projection.translate3D(coordinate[0], coordinate[1]);

    			// Push positions
    			path.push(new THREE.Vector3(v2.x,v2.y, z));

    		}

    	});

    	return path;

    };

    this.getData = function(){

        //determine what to return
        switch(type){

            case 'geoJSON':

                var collection = new IO.classes.Collection();
                collection.parse(data);
                return collection;

            break;

            case 'geoGrid':
            case 'image':

                return data;



    };

    // this.map3D = function(z){
    //
    // 	//determine what to return
    // 	switch(type){
    //
    // 		case 'geoJSON':
    //
    // 			var data3d = [];
    //
    // 			// Add particles after calculating min and max lat & lon
    // 			data.features.forEach(function(child){
    //
    // 				if(child.geometry.type === 'LineString'){
    //
    // 					data3d.push( loadFeature(child.geometry.coordinates, z) );
    //
    // 				}
    //
    // 				else if(child.geometry.type === 'MultiLineString'){
    //
    // 					child.geometry.coordinates.forEach(function(child2){
    //
    // 						data3d.push( loadFeature(child2, z) );
    //
    // 					});
    //
    // 				}
    //
    // 				else if(child.geometry.type === 'Polygon'){
    //
    // 					data3d.push( loadFeature(child.geometry.coordinates, z, true) );
    //
    // 				}
    //
    // 				else if(child.geometry.type === 'Point'){
    //
    //
    // 					var coord = child.geometry.coordinates;
    // 					var v2 = projection.translate3D(coord[0], coord[1], z);
    //
    // 					//get position and properties
    // 					var pos = new THREE.Vector3(v2.x,v2.y, z);
    // 					pos.properties = child.properties;
    // 					data3d.push(pos);
    //
    // 				}
    //
    // 				else {
    //
    // 					console.warn('Unsupported geoJSON feature:', child.geometry.type);
    //
    // 				}
    //
    // 			});
    //
    // 			return data3d;
    //
    // 		case 'geoGrid':
    // 		case 'image':
    //
    // 			return data;
    //
    //
    // 	}
    //
    // };

};
