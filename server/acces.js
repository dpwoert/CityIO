acces = function(){
	
	//only acces locally
	if(__meteor_runtime_config__.ROOT_URL == "http://localhost:3000/"){
		return true;
	}

	return false;

}