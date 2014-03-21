//todo more checking, also for websockets
if(Detector.webgl){
	
	IO.webGL = true;
	Session.set("webgl", true);

} else {
	
	IO.webGL = false;
	Session.set("webgl", false);

}