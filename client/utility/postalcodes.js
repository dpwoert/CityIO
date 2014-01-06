window.PostalCode = function(input){

	var $input = $(input);	
	var code = input.value;

	console.log($input);

	var waiting = function(){
		$input.addClass('waiting');
	}.call(this);

	var showError = function(){
		console.log('cant find it');
		$input.addClass('error');
	};

	var showCode = function(pos){
		
		$input.removeClass('waiting');
		$input.removeClass('error');

		$('li.selected').removeClass('selected');
		$('li.zipcode').addClass('selected');

		DDD.scene.camera.addSpot(code, pos, true);

	};

	Meteor.call('getPostalCode', code.replace(' ','') , function(error, pos){

		if(pos.length > 0){
			showCode(pos[0].geo);
		} else {
			showError();
		}

	});

}