Meteor.startup(function(){

	//url
	window.onhashchange = hashChange;
	hashChange();

	//not loaded anything [remove in future]
	if(location.hash = '#'){
		location.hash = '#!/denBosch';
	}

});