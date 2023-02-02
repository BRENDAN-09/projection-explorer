precision highp float;

uniform samplerCube map;
uniform float w_over_h;
varying vec2 vUv;
uniform mat3 ROTATION;

#define PI 3.1415926


void main(){
    vec2 v = (vUv*2.0 - 1.0)* vec2(w_over_h, 1.0)*3.0;
    vec3 p_from_base = vec3(-v.x, v.y, 2.0);
    float k = 4.0/(dot(v,v)+4.0);
    vec3 s_from_base = k * p_from_base;
    vec3 direction = s_from_base-vec3(0.0,0.0,1.0);
    gl_FragColor = textureCube(map, ROTATION*direction);
}
