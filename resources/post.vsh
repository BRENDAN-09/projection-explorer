attribute vec2 POSITION;
varying vec2 vUv;

void main(){
    vUv = POSITION;
    gl_Position = vec4(POSITION, 0., 1.);
}