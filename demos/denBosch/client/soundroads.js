IO.build.soundRoads = function(world){

    var rangeMin = 5;
    var rangeMax = 30;
    // var rangeMax = Math.pow(75, 1.3);

    var day = this.options.time === 'day';

    //create shader
    var shader = {
        uniforms: {
			"minHeight" : { type: "f", value: rangeMin },
			"maxHeight" : { type: "f", value: rangeMax },
			"colorStart" : { type: "c", value: 0xffffff },
			"colorStop" : { type: "c", value: 0x999999 },
			"colorEnd" : { type: "c", value: 0x000000 },
			"stopPos" : { type: "c", value: 0.5 },

			"day" : { type: "f", value: 1 },

			"currentTime" : { type: "f", value: 0 },
			"fogColor" : { type: "c", value: world.scene.fog.color },
			"fogNight" : { type: "c", value: world.scene.fog.night },
			"fogDay" : { type: "c", value: world.scene.fog.day },
			"fogDensity" : { type: "f", value: world.scene.fog.density },
		},
        vertex: [
            'varying float z;',
            'uniform float maxHeight;',
            'uniform float currentTime;',
            'uniform float day;',

            'void main(void) {',

            	'vec3 pos = position;',
            	'pos.z = pos.z * day;',
                'gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);',
                'z = position.z;',
            '}'
        ].join("\n"),
        fragment: [
            'uniform float minHeight;',
            'uniform float maxHeight;',

            'uniform vec4 colorStart;',
            'uniform vec4 colorStop;',
            'uniform vec4 colorEnd;',
            'uniform float stopPos;',

            'uniform vec3 fogNight;',
            'uniform vec3 fogDay;',
            'uniform float currentTime;',
            'uniform float day;',

            'varying float z;',

            '#ifdef USE_FOG',

            	'uniform vec3 fogColor;',
            	'uniform float fogDensity;',


            '#endif',

            'void main() {',
            	'vec4 color;',
            	'color = mix(colorStart,colorStop, smoothstep(minHeight, maxHeight * stopPos, z));',
            	'color = mix(color,colorEnd, smoothstep(maxHeight * stopPos, maxHeight, z));',
            	'gl_FragColor = color;',

            	'vec3 fogColorMix = mix(fogDay,fogNight, smoothstep(0.0, 1.0, currentTime));',

            	'float depth = gl_FragCoord.z / gl_FragCoord.w;',
            	'const float LOG2 = 1.442695;',
            	'float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );',
            	'fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );',
            	'gl_FragColor = mix( gl_FragColor, vec4( fogColorMix, gl_FragColor.w ), fogFactor );',

            '}'
        ].join("\n")

    };

    //create uniform
    var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

    //uniform options
    this.options.type = this.options.type || 'car';
    if(this.options.type === 'car'){
        uniforms.colorStart = { type: "v4", value: new THREE.Vector4( (252/255), (238/255), (195/255), 1 ) },
    	uniforms.colorStop = { type: "v4", value: new THREE.Vector4( 1 , (192/255) , (1/255), 1 ) },
    	uniforms.colorEnd = { type: "v4", value: new THREE.Vector4( (219/255), (65/255), (44/255), 1 ) },
    	uniforms.stopPos = { type: "f", value: 0.4 }
    } else {
        uniforms.colorStart = { type: "v4", value: new THREE.Vector4( (150/255), (150/255), (150/255), 1 ) },
		uniforms.colorStop = { type: "v4", value: new THREE.Vector4( (100/255), (100/255) , (100/255), 1 ) },
		uniforms.colorEnd = { type: "v4", value: new THREE.Vector4( (0/255), (0/255), (0/255), 1 ) },
		uniforms.stopPos = { type: "f", value: 0.7 }
    }

    //create material
    this.options.material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: shader.vertex,
        fragmentShader: shader.fragment,
        fog: true
    });

    //cycle
    world.cycle.addFunction(function(time){

        var scale = time;
        if(day){
            scale = scale * 2;
            scale = scale > 1 ? 1 : scale;
        } else {
            scale = (scale - 0.5) * 2;
            scale = scale < 0 ? 0 : scale;
        }

        //todo fix day uniform

        uniforms.currentTime.value = time;
        uniforms.day.value = scale;

    });

    return IO.build.roads.call(this, world);

};
