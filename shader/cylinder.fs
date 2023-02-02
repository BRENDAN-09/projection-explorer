precision highp float;

uniform samplerCube map;
uniform float w_over_h;
varying vec2 vUv;
uniform mat3 ROTATION;

#define PI 3.1415926


void main(){
    vec2 v = vUv*2.0 - 1.0;

    vec3 l = normalize(vec3(-sin(v.x*PI), 0.0, cos(v.x*PI)));
    vec3 li = (1.-v.y*v.y)*l + v.y*vec3(0.,1.,0.);
    gl_FragColor = textureCube(map, ROTATION*li);
}
