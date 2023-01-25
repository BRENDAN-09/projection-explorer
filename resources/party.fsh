precision highp float;

uniform sampler2D source;
uniform sampler2D depth;
uniform float threshold;
varying vec2 vUv;

void main(){
    vec2 uv = vUv*0.5+0.5;
    float factor = 1.0-max(abs(vUv.x), abs(vUv.y));
    vec2 disp = vec2(sin(vUv.x*5.),sin(vUv.y*5.));
    gl_FragColor = texture2D(source, uv+threshold*factor*disp);
}