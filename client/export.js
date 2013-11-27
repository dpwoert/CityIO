window.Export = {};

Export.Object = function (object) {

	var exporter = new THREE.ObjectExporter();

	var output = JSON.stringify( exporter.parse( object ), null, '\t' );
	output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

	console.save(output);

};