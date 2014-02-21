Meteor.startup(function(){

	//url
	window.onhashchange = hashChange;
	hashChange();

});