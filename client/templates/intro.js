var video;

//variables
Session.set("hideIntro", false);
Session.set("buffer", false);


//intro
Template.intro.rendered = function(){

	//Detect WebGL
	if(!Detector.webgl){
		Session.set("webgl", false);
		ga('send', 'event', 'old-browser', 'true');
	} else {
		Session.set("webgl", true);
		//ga('send', 'event', 'old-browser', 'false');
	}

};

Template.preloader.helpers({

	'webgl': function(){
		return Session.get('webgl');
	},

	'button': function(){
		return ( !Session.get('webgl') || Session.get('loaded') );
	},

	'status': function(){

		if(Session.get('buffer')){
			return 'buffer';
		} 
		else if(Session.get('loaded')){
			return 'loaded';
		}
	}

});

Template.intro.events({

	'canplay video': function(event){

		//prevent double loading
		if(event.currentTarget.className == 'loaded') return false;

		//play
		event.currentTarget.className = 'loaded';
		
		//load data when video is loaded
		if(Session.get('webgl')){
			Session.set("buffer", true);
			loadUrl();
		} 

	},

	'click .loaded .bar': function(){
		Session.set("hideIntro", true);
		DDD.preloader.hidden = true;
	},

	'click .no-webgl .bar': function(){
		document.location = 'https://vimeo.com/87603478';
	}

})

//hide?
Template.intro.hidden = function(){
	return Session.get("hideIntro");
};

