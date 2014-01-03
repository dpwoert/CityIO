var video;

//variables
Session.set("hideIntro", false);
Session.set("loaderCopy", 'Downloading...');

//intro
Template.intro.rendered = function(){

	video = this.find('video');
	
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
