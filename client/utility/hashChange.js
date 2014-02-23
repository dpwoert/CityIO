window.hashChange = function(){
	
	//get url
	var url = location.hash;
	url = url.replace('#!/','');
	url = url.replace('/','');
	url = url.toLowerCase();

	switch(url){

		//buildpacks
		case '':
		case 'denbosch':
		case 'shertogenbosch':
		case 's-hertogenbosch':
			console.log('url: den Bosch');
			buildpacks.denBosch();
		break;

		case 'amsterdam':
			console.log('url: amsterdamn');
			buildpacks.amsterdam();
		break;

		case 'rotterdam':
			console.log('url: rotterdamn');
			buildpacks.rotterdam();
		break;

	}

}