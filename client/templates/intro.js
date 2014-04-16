var video;

//variables
Session.set("hideIntro", false);
Session.set("buffer", false);

Template.preloader.helpers({

	'webgl': function(){
		return Session.get('webgl');
	},

	'button': function(){
		return ( !Session.get('webgl') || Session.get('loaded') );
	},

	'status': function(){

		if(Session.get('buffer')){
			//return 'buffer';
		}
		else if(Session.get('loaded')){
			return 'loaded';
		}
	},

	'isBuffering': function(){

		//todo fix this properly in future
		console.log('BUFFER:', Session.get('buffer'))
		return Session.get('buffer');

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
		}

	},

	'click .loaded .bar': function(){
		Session.set("hideIntro", true);
		IO.start3d();
	},

	'click .no-webgl .bar': function(){
		//document.location = 'https://vimeo.com/87603478';
	}

})

//hide?
Template.intro.hidden = function(){
	return Session.get("hideIntro");
};
