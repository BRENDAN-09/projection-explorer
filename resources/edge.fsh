precision highp float;

uniform sampler2D source;
uniform sampler2D depth;
uniform float threshold;
uniform float pix;
varying vec2 vUv;

const float pi = 3.14159;

 vec3 angle_to_hue(float theta){
    return vec3(sin(theta),sin(theta+2.0*pi/3.0),sin(theta+4.0*pi/3.0));
}

float atan2(float y,float x){
    if(x>0.) return atan(y,x);
    if(x<0. && y>=0.) return atan(y,x)+pi;
    if(x<0. && y < 0.)return atan(y,x)-pi;
    if(x==0.&&y>0.)return pi*0.5;
    if(x==0.&&y<0.)return -pi*0.5;
    return 0.;
}

void main(){
    vec2 uv = vUv*0.5+0.5;
    vec3 i = vec3(0.0);
    vec3 j = vec3(0.0);
    vec3 a;

    a = texture2D(source, uv+vec2(pix,pix)).rgb;
    i -= a; j -= a;
    a = texture2D(source, uv+vec2(-pix,pix)).rgb;
    i -= a; j += a;
    a = texture2D(source, uv+vec2(-pix,-pix)).rgb;
    i += a; j += a;
    a = texture2D(source, uv+vec2(pix,-pix)).rgb;
    i += a; j -= a;
    i += 2.0 * texture2D(source, uv+vec2(-pix,0.0)).rgb;
    i -= 2.0 * texture2D(source, uv+vec2(pix,0.0)).rgb;
    j += 2.0 * texture2D(source, uv+vec2(0.0,-pix)).rgb;
    j -= 2.0 * texture2D(source, uv+vec2(0.0,+pix)).rgb;

    float grad_y = dot(i, vec3(1.));
    float grad_x = dot(j, vec3(1.));
    float edge_mag = sqrt(grad_y*grad_y+grad_x*grad_x);
    

    gl_FragColor = vec4(edge_mag*vec3(0.0,1.0,0.4),1.0);

}