window.showPopup = function(name, overlay){


	//hide?
	if(name === false){
		$('.popup, .overlay').removeClass('visible');
		return false;
	}

	//get correct popup
	var c;
	switch(name){

		case 'controls': c='.controls'; break;
		case 'legenda': c='.legenda'; break;
		case 'sources': c='.sources'; break;

	}

	$popup = $('.popup' + c);
	$popup.addClass('visible');

	//overlay
	if(overlay){
		$('.overlay').addClass('visible');
	}

	//close
	$('.overlay, .continue').unbind().click(function(){
		showPopup(false);
	})

};