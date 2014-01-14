//navigation
Template.navigation.rendered = function(){

	//postcode
	var zipInput = this.find('input.code');
	var zipButton = this.find('input.go');

	zipButton.onclick = function(){

		var show = new PostalCode(zipInput);

	}

	//day/night
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