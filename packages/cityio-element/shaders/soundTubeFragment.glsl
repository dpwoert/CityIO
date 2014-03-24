uniform float minHeight;
uniform float maxHeight;

uniform vec4 colorStart;
uniform vec4 colorStop;
uniform vec4 colorEnd;
uniform float stopPos;

uniform vec3 fogNight;
uniform vec3 fogDay;
uniform float currentTime;
uniform float day;

varying float z;

#ifdef USE_FOG

	uniform vec3 fogColor;
	uniform float fogDensity;


#endif

void main() {
	vec4 color;
	color = mix(colorStart,colorStop, smoothstep(minHeight, maxHeight * stopPos, z));
	color = mix(color,colorEnd, smoothstep(maxHeight * stopPos, maxHeight, z));
	gl_FragColor = color;

	vec3 fogColorMix = mix(fogDay,fogNight, smoothstep(0.0, 1.0, currentTime));

	float depth = gl_FragCoord.z / gl_FragCoord.w;
	const float LOG2 = 1.442695;
	float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
	fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );
	gl_FragColor = mix( gl_FragColor, vec4( fogColorMix, gl_FragColor.w ), fogFactor );

}