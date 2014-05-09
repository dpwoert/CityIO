#define LAMBERT
varying vec3 vLightFront;
#ifdef DOUBLE_SIDED
	varying vec3 vLightBack;
#endif
#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP )
	varying vec2 vUv;
	uniform vec4 offsetRepeat;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vUv2;
#endif
#if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP )
	varying vec3 vReflect;
	uniform float refractionRatio;
	uniform bool useRefract;
#endif
uniform vec3 ambient;
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 ambientLightColor;
#if MAX_DIR_LIGHTS > 0
	uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];
	uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];
#endif
#if MAX_HEMI_LIGHTS > 0
	uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];
	uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];
	uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];
#endif
#if MAX_POINT_LIGHTS > 0
	uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];
	uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];
	uniform float pointLightDistance[ MAX_POINT_LIGHTS ];
#endif
#if MAX_SPOT_LIGHTS > 0
	uniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];
	uniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];
	uniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];
	uniform float spotLightDistance[ MAX_SPOT_LIGHTS ];
	uniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];
	uniform float spotLightExponent[ MAX_SPOT_LIGHTS ];
#endif
#ifdef WRAP_AROUND
	uniform vec3 wrapRGB;
#endif
#ifdef USE_COLOR
	varying vec3 vColor;
#endif
#ifdef USE_MORPHTARGETS
	#ifndef USE_MORPHNORMALS
	uniform float morphTargetInfluences[ 8 ];
	#else
	uniform float morphTargetInfluences[ 4 ];
	#endif
#endif
#ifdef USE_SKINNING
	#ifdef BONE_TEXTURE
		uniform sampler2D boneTexture;
		uniform int boneTextureWidth;
		uniform int boneTextureHeight;
		mat4 getBoneMatrix( const in float i ) {
			float j = i * 4.0;
			float x = mod( j, float( boneTextureWidth ) );
			float y = floor( j / float( boneTextureWidth ) );
			float dx = 1.0 / float( boneTextureWidth );
			float dy = 1.0 / float( boneTextureHeight );
			y = dy * ( y + 0.5 );
			vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );
			vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );
			vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );
			vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );
			mat4 bone = mat4( v1, v2, v3, v4 );
			return bone;
		}
	#else
		uniform mat4 boneGlobalMatrices[ MAX_BONES ];
		mat4 getBoneMatrix( const in float i ) {
			mat4 bone = boneGlobalMatrices[ int(i) ];
			return bone;
		}
	#endif
#endif
#ifdef USE_SHADOWMAP
	varying vec4 vShadowCoord[ MAX_SHADOWS ];
	uniform mat4 shadowMatrix[ MAX_SHADOWS ];
#endif
#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
	#endif
	uniform float logDepthBufFC;
#endif
void main() {
#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP )
	vUv = uv * offsetRepeat.zw + offsetRepeat.xy;
#endif
#ifdef USE_LIGHTMAP
	vUv2 = uv2;
#endif
#ifdef USE_COLOR
	#ifdef GAMMA_INPUT
		vColor = color * color;
	#else
		vColor = color;
	#endif
#endif
#ifdef USE_MORPHNORMALS
	vec3 morphedNormal = vec3( 0.0 );
	morphedNormal +=  ( morphNormal0 - normal ) * morphTargetInfluences[ 0 ];
	morphedNormal +=  ( morphNormal1 - normal ) * morphTargetInfluences[ 1 ];
	morphedNormal +=  ( morphNormal2 - normal ) * morphTargetInfluences[ 2 ];
	morphedNormal +=  ( morphNormal3 - normal ) * morphTargetInfluences[ 3 ];
	morphedNormal += normal;
#endif
#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif
#ifdef USE_SKINNING
	mat4 skinMatrix = skinWeight.x * boneMatX;
	skinMatrix 	+= skinWeight.y * boneMatY;
	skinMatrix 	+= skinWeight.z * boneMatZ;
	skinMatrix 	+= skinWeight.w * boneMatW;
	#ifdef USE_MORPHNORMALS
	vec4 skinnedNormal = skinMatrix * vec4( morphedNormal, 0.0 );
	#else
	vec4 skinnedNormal = skinMatrix * vec4( normal, 0.0 );
	#endif
#endif
vec3 objectNormal;
#ifdef USE_SKINNING
	objectNormal = skinnedNormal.xyz;
#endif
#if !defined( USE_SKINNING ) && defined( USE_MORPHNORMALS )
	objectNormal = morphedNormal;
#endif
#if !defined( USE_SKINNING ) && ! defined( USE_MORPHNORMALS )
	objectNormal = normal;
#endif
#ifdef FLIP_SIDED
	objectNormal = -objectNormal;
#endif
vec3 transformedNormal = normalMatrix * objectNormal;
#ifdef USE_MORPHTARGETS
	vec3 morphed = vec3( 0.0 );
	morphed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];
	morphed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];
	morphed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];
	morphed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];
	#ifndef USE_MORPHNORMALS
	morphed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];
	morphed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];
	morphed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];
	morphed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];
	#endif
	morphed += position;
#endif
#ifdef USE_SKINNING
	#ifdef USE_MORPHTARGETS
	vec4 skinVertex = vec4( morphed, 1.0 );
	#else
	vec4 skinVertex = vec4( position, 1.0 );
	#endif
	vec4 skinned  = boneMatX * skinVertex * skinWeight.x;
	skinned      += boneMatY * skinVertex * skinWeight.y;
	skinned      += boneMatZ * skinVertex * skinWeight.z;
	skinned      += boneMatW * skinVertex * skinWeight.w;
#endif
vec4 mvPosition;
#ifdef USE_SKINNING
	mvPosition = modelViewMatrix * skinned;
#endif
#if !defined( USE_SKINNING ) && defined( USE_MORPHTARGETS )
	mvPosition = modelViewMatrix * vec4( morphed, 1.0 );
#endif
#if !defined( USE_SKINNING ) && ! defined( USE_MORPHTARGETS )
	mvPosition = modelViewMatrix * vec4( position, 1.0 );
#endif
gl_Position = projectionMatrix * mvPosition;
#ifdef USE_LOGDEPTHBUF
	gl_Position.z = log2(max(1e-6, gl_Position.w + 1.0)) * logDepthBufFC;
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
#else
		gl_Position.z = (gl_Position.z - 1.0) * gl_Position.w;
	#endif
#endif
#if defined( USE_ENVMAP ) || defined( PHONG ) || defined( LAMBERT ) || defined ( USE_SHADOWMAP )
	#ifdef USE_SKINNING
		vec4 worldPosition = modelMatrix * skinned;
	#endif
	#if defined( USE_MORPHTARGETS ) && ! defined( USE_SKINNING )
		vec4 worldPosition = modelMatrix * vec4( morphed, 1.0 );
	#endif
	#if ! defined( USE_MORPHTARGETS ) && ! defined( USE_SKINNING )
		vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
	#endif
#endif
#if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP )
	vec3 worldNormal = mat3( modelMatrix[ 0 ].xyz, modelMatrix[ 1 ].xyz, modelMatrix[ 2 ].xyz ) * objectNormal;
	worldNormal = normalize( worldNormal );
	vec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
	if ( useRefract ) {
		vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
	} else {
		vReflect = reflect( cameraToVertex, worldNormal );
	}
#endif
vLightFront = vec3( 0.0 );
#ifdef DOUBLE_SIDED
	vLightBack = vec3( 0.0 );
#endif
transformedNormal = normalize( transformedNormal );
#if MAX_DIR_LIGHTS > 0
for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {
	vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );
	vec3 dirVector = normalize( lDirection.xyz );
	float dotProduct = dot( transformedNormal, dirVector );
	vec3 directionalLightWeighting = vec3( max( dotProduct, 0.0 ) );
	#ifdef DOUBLE_SIDED
		vec3 directionalLightWeightingBack = vec3( max( -dotProduct, 0.0 ) );
		#ifdef WRAP_AROUND
			vec3 directionalLightWeightingHalfBack = vec3( max( -0.5 * dotProduct + 0.5, 0.0 ) );
		#endif
	#endif
	#ifdef WRAP_AROUND
		vec3 directionalLightWeightingHalf = vec3( max( 0.5 * dotProduct + 0.5, 0.0 ) );
		directionalLightWeighting = mix( directionalLightWeighting, directionalLightWeightingHalf, wrapRGB );
		#ifdef DOUBLE_SIDED
			directionalLightWeightingBack = mix( directionalLightWeightingBack, directionalLightWeightingHalfBack, wrapRGB );
		#endif
	#endif
	vLightFront += directionalLightColor[ i ] * directionalLightWeighting;
	#ifdef DOUBLE_SIDED
		vLightBack += directionalLightColor[ i ] * directionalLightWeightingBack;
	#endif
}
#endif
#if MAX_POINT_LIGHTS > 0
	for( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {
		vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );
		vec3 lVector = lPosition.xyz - mvPosition.xyz;
		float lDistance = 1.0;
		if ( pointLightDistance[ i ] > 0.0 )
			lDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );
		lVector = normalize( lVector );
		float dotProduct = dot( transformedNormal, lVector );
		vec3 pointLightWeighting = vec3( max( dotProduct, 0.0 ) );
		#ifdef DOUBLE_SIDED
			vec3 pointLightWeightingBack = vec3( max( -dotProduct, 0.0 ) );
			#ifdef WRAP_AROUND
				vec3 pointLightWeightingHalfBack = vec3( max( -0.5 * dotProduct + 0.5, 0.0 ) );
			#endif
		#endif
		#ifdef WRAP_AROUND
			vec3 pointLightWeightingHalf = vec3( max( 0.5 * dotProduct + 0.5, 0.0 ) );
			pointLightWeighting = mix( pointLightWeighting, pointLightWeightingHalf, wrapRGB );
			#ifdef DOUBLE_SIDED
				pointLightWeightingBack = mix( pointLightWeightingBack, pointLightWeightingHalfBack, wrapRGB );
			#endif
		#endif
		vLightFront += pointLightColor[ i ] * pointLightWeighting * lDistance;
		#ifdef DOUBLE_SIDED
			vLightBack += pointLightColor[ i ] * pointLightWeightingBack * lDistance;
		#endif
	}
#endif
#if MAX_SPOT_LIGHTS > 0
	for( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {
		vec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );
		vec3 lVector = lPosition.xyz - mvPosition.xyz;
		float spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - worldPosition.xyz ) );
		if ( spotEffect > spotLightAngleCos[ i ] ) {
			spotEffect = max( pow( spotEffect, spotLightExponent[ i ] ), 0.0 );
			float lDistance = 1.0;
			if ( spotLightDistance[ i ] > 0.0 )
				lDistance = 1.0 - min( ( length( lVector ) / spotLightDistance[ i ] ), 1.0 );
			lVector = normalize( lVector );
			float dotProduct = dot( transformedNormal, lVector );
			vec3 spotLightWeighting = vec3( max( dotProduct, 0.0 ) );
			#ifdef DOUBLE_SIDED
				vec3 spotLightWeightingBack = vec3( max( -dotProduct, 0.0 ) );
				#ifdef WRAP_AROUND
					vec3 spotLightWeightingHalfBack = vec3( max( -0.5 * dotProduct + 0.5, 0.0 ) );
				#endif
			#endif
			#ifdef WRAP_AROUND
				vec3 spotLightWeightingHalf = vec3( max( 0.5 * dotProduct + 0.5, 0.0 ) );
				spotLightWeighting = mix( spotLightWeighting, spotLightWeightingHalf, wrapRGB );
				#ifdef DOUBLE_SIDED
					spotLightWeightingBack = mix( spotLightWeightingBack, spotLightWeightingHalfBack, wrapRGB );
				#endif
			#endif
			vLightFront += spotLightColor[ i ] * spotLightWeighting * lDistance * spotEffect;
			#ifdef DOUBLE_SIDED
				vLightBack += spotLightColor[ i ] * spotLightWeightingBack * lDistance * spotEffect;
			#endif
		}
	}
#endif
#if MAX_HEMI_LIGHTS > 0
	for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {
		vec4 lDirection = viewMatrix * vec4( hemisphereLightDirection[ i ], 0.0 );
		vec3 lVector = normalize( lDirection.xyz );
		float dotProduct = dot( transformedNormal, lVector );
		float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;
		float hemiDiffuseWeightBack = -0.5 * dotProduct + 0.5;
		vLightFront += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );
		#ifdef DOUBLE_SIDED
			vLightBack += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeightBack );
		#endif
	}
#endif
vLightFront = vLightFront * diffuse + ambient * ambientLightColor + emissive;
#ifdef DOUBLE_SIDED
	vLightBack = vLightBack * diffuse + ambient * ambientLightColor + emissive;
#endif
#ifdef USE_SHADOWMAP
	for( int i = 0; i < MAX_SHADOWS; i ++ ) {
		vShadowCoord[ i ] = shadowMatrix[ i ] * worldPosition;
	}
#endif
}