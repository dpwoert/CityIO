varying float z;
uniform float maxHeight;
uniform float currentTime;
uniform float day;

void main(void) {

	vec3 pos = position;
	pos.z = pos.z * day;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    z = position.z;
}