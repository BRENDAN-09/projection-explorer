precision highp float;

uniform samplerCube map;
uniform float w_over_h;
varying vec2 vUv;
uniform mat3 ROTATION;

#define PI 3.1415926


void main(){
    vec2 v = vUv*2.0 - 1.0;
    float latitude = v.y*PI/2.0;
    float longitude = -v.x*PI/cos(latitude);
    if(longitude< -PI || longitude > PI) discard;
    vec3 direction = vec3(sin(longitude)*cos(latitude), sin(latitude), cos(longitude)*cos(latitude));
    gl_FragColor = textureCube(map, ROTATION*direction);
}
