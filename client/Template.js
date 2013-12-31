//navigation
Template.navigation.rendered = function(){

	//postcode
	var input = this.find('input.code');
	var button = this.find('input.go');

	button.onclick = function(){

		var show = new PostalCode(input.value);

	}

}