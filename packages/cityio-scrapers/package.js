Package.describe({
	summary: "cityIO - Global Scrapers"
});

//require npm via server
Npm.depends({
	'png.js': '0.1.1'
});

Package.on_use(function (api) {

	// use dependencies
	api.use(['cityio','Q'], 'server');

	//load server
	api.add_files([

		'scrapers/NSL.js',
		'scrapers/AHN.js',
		'scrapers/citySDK.js',

		'batch/AHN.js'

	], 'server');

});
