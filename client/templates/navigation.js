//navigation
Template.navigation.rendered = function(){

	//day/night elements
	var day = this.find('span.day');
	var night = this.find('span.night');

	day.onclick = function(){

		DDD.timeline.switchTo(true);
		day.className = 'day selected';
		night.className = 'night';

	};

	night.onclick = function(){

		DDD.timeline.switchTo(false);
		day.className = 'day';
		night.className = 'night selected';

	};

}