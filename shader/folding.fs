precision highp float;

uniform samplerCube map;
uniform float w_over_h;
varying vec2 vUv;
uniform mat3 ROTATION;

#define PI 3.1415926
#define n_slice 17.0


void main(){
    vec2 v = vUv*2.0 - 1.0;
    float latitude = v.y*PI/2.0;
    float x = v.x*-1.0;

    float anchor = 2.0 * (floor(x * n_slice /2.0 -0.5)+1.0) / n_slice;
    float threshold = 1.0/n_slice;

    float slice_x = (x - anchor)/cos(latitude);
    float multiplier = 1.0 - smoothstep(threshold, threshold*1.1, abs(slice_x));
    float longitude = (anchor+slice_x) * PI;


    
    
    

    // float longitude = -v.x*PI/cos(latitude);
    //if(longitude< -PI || longitude > PI) discard;
    vec3 direction = vec3(sin(longitude)*cos(latitude), sin(latitude), cos(longitude)*cos(latitude));
    //gl_FragColor = vec4(vec3(gap),1.0);
    gl_FragColor = textureCube(map, ROTATION*direction) * multiplier;
    //gl_FragColor = vec4(vec3(gap+1.0/n_slice),1.0);
}
