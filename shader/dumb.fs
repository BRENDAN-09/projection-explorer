precision highp float;

uniform samplerCube map;
uniform float w_over_h;
varying vec2 vUv;
uniform mat3 ROTATION;

#define PI 3.1415926


void main(){
    vec2 v = (vUv*2.0 - 1.0)*vec2(w_over_h, 1.0);
    float longitude = -v.x*PI;

    vec3 direction = normalize(vec3(sin(longitude), v.y*PI, cos(longitude)));
    gl_FragColor = textureCube(map, ROTATION*direction);
}
