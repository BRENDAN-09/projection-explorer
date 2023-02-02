precision highp float;

uniform samplerCube map;
uniform float w_over_h;
varying vec2 vUv;
uniform mat3 ROTATION;

#define PI 3.1415926


void main(){
    vec2 v = (vUv*2.0 - 1.0)*2.0;
    if(length(v)>2.0)discard;

    float perp = dot(v,v)/2.0-1.0;
    vec2 para = sqrt(1.0-perp*perp)*normalize(v);
    vec3 direction = vec3(-para.x,para.y, -perp);
    gl_FragColor = textureCube(map, ROTATION*direction);
}
