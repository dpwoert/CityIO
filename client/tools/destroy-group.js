module.exports = function(group, scene){

	//no children in group
	if(!group.children){
		return false;
	}

	for( var i = 0 ; i < group.children.length ; i++ ){

		var object = group.children[i];

		if(scene){
			scene.remove(object);
		}
		group.remove(object);

		if (object.geometry) {
			object.geometry.dispose();
			object.geometry = undefined;
		}
		if (object.material) {


			if (object.material.materials){

                for (i = 0; i < object.material.materials.length; i++){
                    object.material.materials[i].dispose();
                }

            }
            else {
                object.material.dispose();
            }

            object.material = undefined;
		}
		if (object.texture) {
			object.texture.dispose();
			object.texture = undefined;
		}

		if (object.dispose) {
			object.dispose();
		}

		object = undefined;

	}

};
