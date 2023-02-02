precision highp float;

uniform samplerCube map;
uniform float w_over_h;
varying vec2 vUv;
uniform mat3 ROTATION;

#define PI 3.1415926


void main(){
    vec2 v = vUv*2.0 - 1.0;
    float longitude = -v.x*PI;
    float lattitude = v.y*PI/2.0; 

    vec3 direction = vec3(sin(longitude)*cos(lattitude), sin(lattitude), cos(longitude)*cos(lattitude));
    gl_FragColor = textureCube(map, ROTATION*direction);
}
