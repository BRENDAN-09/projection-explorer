precision highp float;

uniform samplerCube map;
varying vec2 vUv;
uniform float w_over_h;
uniform mat3 ROTATION;

#define PI 3.1415926


void main(){
    vec2 v = (vUv*2.0 - 1.0)*2.0;
    if(length(v)>2.0)discard;
    float longitude = atan(v.x,v.y)*sqrt(2.0);
    if(abs(longitude)>PI)discard;
    float latitude = PI/2.0*(1.0-length(v));
    vec3 direction = vec3(sin(longitude)*cos(latitude), sin(latitude), cos(longitude)*cos(latitude));
    gl_FragColor = textureCube(map, ROTATION*direction);
}
