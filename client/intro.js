var video;

//variables
Session.set("hideIntro", false);
Session.set("loaderCopy", 'Downloading...');
Session.set("buffer", true);


//intro
Template.intro.rendered = function(){

	//Detect WebGL
	if(!Detector.webgl){
		Session.set("loaderCopy", "Oops, it looks you are using an old browser. We recommend to use the newest version of Chrome to see the fully functioning map");
		var loader = this.find('#preloader');
		loader.innerHTML = 'Demo';
		loader.className = 'button';

		ga('send', 'event', 'old-browser', 'true');
	} else {
		ga('send', 'event', 'old-browser', 'false');
	}

	video = this.find('video');

	if(!video) return false;
	
	video.addEventListener("canplay",function(){

		//loaded video so start loading data
		video.className = 'loaded';
		data.init();

	});

};

//hide?
Template.intro.hidden = function(){
	return Session.get("hideIntro");
};

//preloader
Template.preloader.copy = function(){
	return Session.get("loaderCopy");
};

Template.preloader.buffer = function(){
	return Session.get("buffer");
};
