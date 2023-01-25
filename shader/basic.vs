attribute vec2 POSITION;
varying vec2 vUv;

void main(){
    vUv = POSITION*vec2(0.5,-0.5)+0.5;
    gl_Position = vec4(POSITION, 1., 1.);
}