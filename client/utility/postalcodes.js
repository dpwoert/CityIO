window.PostalCode = function(code){
	

	var waiting = function(){

	}.call(this);

	var showError = function(){
		console.log('cant find it');
	};

	var showCode = function(pos){
		console.log(pos);

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