precision highp float;

uniform samplerCube map;
varying vec2 vUv;
uniform mat4 rotation;

#define PI 3.1415926


void main(){
    vec2 v = vUv*2.0 - 1.0;
    //vec2  = vUv * 10.;
    //vec2 vPrime = vec2(sin(v.y), -sin(v.x))/512.;
    //vec2 vPrime = -vUv * (sin(length(v * 2.))+2.)/512.;
    //vec2 vPrime = normalize(vec2(v.y, -v.x)) * (sin(length(v))+2.)/512.;
    //vec2 vPrime = vec2(-0.05 * v.x - v.y + cos(2. * v.x), v.x - 0.05 * v.y + sin(2. * v.y))/1024.;
    //v = vUv * 4.; vec2 vPrime = vec2(-v.y+cos(2. * v.x), v.x + sin(2. * v.y))/2000.;
    //v = vUv * 1.; vec2 vPrime = vec2(1,sin(v.x*v.x+v.y*v.y))/2000.;
    //vec2 vPrime = vec2(1.,0.)/1000.;
    //vec2 vPrime = (v.y*v.y*v.y-9*v.y,v.x*v/x*v.x-9*v.x);
    //vec2 vPrime = vec2(1., sin(v.x)/3.) / sqrt(1.+sin(v.x)*sin(v.x)/9.)/1000.;

    vec3 l = normalize(vec3(-sin(v.x*PI), 0.0, cos(v.x*PI)));
    vec3 li = (1.-v.y*v.y)*l + v.y*vec3(0.,1.,0.);
    //vec2 base = (vUv/2.+vec2(0.5,0.5));
    gl_FragColor = textureCube(map, li);
}
