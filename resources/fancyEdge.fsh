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

float get_depth(vec2 uv){
    float n = 1.0;
	float f = 1000.0;
	float z = texture2D(depth, uv).x;
	return (2.0 * n) / (f + n - z*(f-n));
}

void main(){
    vec2 uv = vUv*0.5+0.5;
    float i = 0.0;
    float j = 0.0;
    float a;
	// float z = texture2D(depth, uv).x;
	// float grey = (2.0 * n) / (f + n - z*(f-n));

    a = get_depth(uv+vec2(pix,pix));
    i -= a; j -= a;
    a = get_depth(uv+vec2(-pix,pix));
    i -= a; j += a;
    a = get_depth(uv+vec2(-pix,-pix));
    i += a; j += a;
    a = get_depth(uv+vec2(pix,-pix));
    i += a; j -= a;
    i += 2.0 * get_depth(uv+vec2(-pix,0.0));
    i -= 2.0 * get_depth(uv+vec2(pix,0.0));
    j += 2.0 * get_depth(uv+vec2(0.0,-pix));
    j -= 2.0 * get_depth(uv+vec2(0.0,+pix));

    float grad_y = i;
    float grad_x = j;
    float edge_mag = sqrt(grad_y*grad_y+grad_x*grad_x);
    float angle = atan2(grad_y,grad_x);

    
	
    

    gl_FragColor = vec4(edge_mag*vec3(0.0,1.0,0.4),1.0)+texture2D(source, uv);

}