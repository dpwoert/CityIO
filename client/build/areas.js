var THREE = require('three');

//shaders
var vertexShader = ['varying float z;',
'void main(void) {',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    'z = position.z;',
'}'].join("\n");

var fragmentShader = ['uniform vec3 colorDay;',
'uniform vec3 colorNight;',
'uniform vec3 fogNight;',
'uniform vec3 fogDay;',
'uniform float currentTime;',

'varying float z;',

'#ifdef USE_FOG',

	'uniform vec3 fogColor;',
	'uniform float fogDensity;',

'#endif',

'void main() {',

	'vec4 c1 = vec4(colorDay,1.0);',
	'vec4 c2 = vec4(colorNight,1.0);',
	'gl_FragColor = mix(c1,c2, smoothstep(0.0, 1.0, currentTime));',

	'vec3 fogColorMix = mix(fogDay,fogNight, smoothstep(0.0, 1.0, currentTime));',

	'float depth = gl_FragCoord.z / gl_FragCoord.w;',
	'const float LOG2 = 1.442695;' +
	'float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );',
	'fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );',
	'gl_FragColor = mix( gl_FragColor, vec4( fogColorMix, gl_FragColor.w ), fogFactor );',

'}'].join("\n");

module.exports = function(world){

    var self = this;

    //fixed height
    this.options.height = function(properties, group){
        return (1 * group.nr);
    };

    //color material
    this.options.createMaterial = function(color, i){

        //get night color
        var colorNight = self.options.night[i];

        //uniforms
    	var uniforms = {
    		"currentTime" : { type: "f", value: 0.0 },
    		"colorDay" : { type: "c", value: new THREE.Color(color) },
    		"colorNight" : { type: "c", value: new THREE.Color(colorNight) },

    		"fogColor" : { type: "c", value: world.scene.fog.color },
    		"fogNight" : { type: "c", value: world.scene.fog.night },
    		"fogDay" : { type: "c", value: world.scene.fog.day },
    		"fogDensity" : { type: "f", value: world.scene.fog.density },
    	};

    	//material
    	return new THREE.ShaderMaterial({
    		uniforms: uniforms,
    	    vertexShader: vertexShader,
    	    fragmentShader: fragmentShader,
    	    fog: true
    	});

    };

    //defer to buildings
    return IO.build.buildings.call(this, world);

};
