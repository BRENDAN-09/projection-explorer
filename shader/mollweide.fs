precision highp float;

uniform samplerCube map;
uniform float w_over_h;
varying vec2 vUv;
uniform mat3 ROTATION;

#define PI 3.1415926


void main(){
    vec2 v = (vUv*2.0 - 1.0)*vec2(2.0*sqrt(2.0),sqrt(2.0));
    float theta = asin(v.y/sqrt(2.0));
    float latitude = asin((2.0*theta+sin(2.0*theta))/PI);
    float longitude = -v.x*PI/2.0/sqrt(2.0)/cos(theta);
    if(longitude< -PI || longitude > PI) discard;
    vec3 direction = vec3(sin(longitude)*cos(latitude), sin(latitude), cos(longitude)*cos(latitude));
    gl_FragColor = textureCube(map, ROTATION*direction);
}
