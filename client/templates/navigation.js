//timeline start at day
Session.set('timeline', true);

//helpers
Template.navigation.helpers({

	'timeline': function(){
		return Session.get('timeline');
	},

	'cameraPoints': function(){
		//TODO
	}

});

//events
Template.navigation.events({

	'click span.day': function(event){
		DDD.timeline.switchTo(true);
		Session.set('timeline', true);
	},

	'click span.night': function(){
		DDD.timeline.switchTo(false);
		Session.set('timeline', false);
	}

});