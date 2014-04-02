// https://github.com/mourner/suncalc
Package.describe({
	summary: "Suncalc - SunCalc is a JavaScript library for calculating sun/moon position and light phases."
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api) {

	//server via NPM
	api.add_files('suncalc.js', 'client');

});
