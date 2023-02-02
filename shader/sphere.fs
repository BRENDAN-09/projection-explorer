precision mediump float;
uniform float w_over_h;
varying vec2 vUv;
uniform samplerCube map;
uniform mat3 ROTATION;

// vec3 dir_to_col(vec3 dir){
//     return texture2D(map, vec2(atan(dir.z,dir.x)/3.145159+1.0, dir.y/2.0+0.5)).rgb;
// }

void main(){
    vec2 p = vUv * 2.0-1.0;
    float l = length(p);
    if(l>1.0)discard;
    vec3 v = vec3(p*vec2(-1.0,1.0), sqrt(1.0-l*l));
    gl_FragColor = textureCube(map, ROTATION*v).rgba+vec4(0.3);//vec4(dir_to_col(v),1.0);//texture2D(map, vUv);
}