Package.describe({
	summary: "cityIO - Detect browser compatibility"
});

Package.on_use(function (api) {

	// use dependencies
	api.use(['three', 'cityio','session'], "client");

	// load front-end
	api.add_files('lib/detector.js', 'client', {bare:true});
	api.add_files('compatibility.js', 'client');


});