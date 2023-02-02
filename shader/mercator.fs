precision highp float;

uniform samplerCube map;
uniform float w_over_h;
varying vec2 vUv;
uniform mat3 ROTATION;

#define PI 3.1415926


void main(){
    vec2 v = (vUv*2.0 - 1.0) * vec2(w_over_h, 1.0);
    float longitude = -v.x*PI;
    float latitude = 2.0*atan(exp(v.y*PI))-PI/2.0;
    vec3 direction = vec3(sin(longitude)*cos(latitude), sin(latitude), cos(longitude)*cos(latitude));
    gl_FragColor = textureCube(map, ROTATION*direction);
}
