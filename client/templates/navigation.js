//timeline start at day
Session.set('timeline', true);
Session.set('cameraPoints', []);

//helpers
Template.navigation.helpers({

	'timeline': function(){
		return Session.get('timeline');
	},

	'cameraPoints': function(){
		return Session.get('cameraPoints');
	}

});

//events
Template.navigation.events({

	'click span.day': function(event){
		IO.timeline.switchTo(true);
		Session.set('timeline', true);
	},

	'click span.night': function(){
		IO.timeline.switchTo(false);
		Session.set('timeline', false);
	},

	'click .cameraPositions li': function(evt){

		var $e = $(evt.target);
		IO.cameraControl.switchTo($e.attr('rel'));
		$e.parent().find('.selected').removeClass('selected');
		$e.addClass('selected');

	}

});

Template.navigation.rendered = function(){

	$('.cameraPosition li').eq(0).addClass('selected');

}
