precision highp float;

uniform sampler2D source;
varying vec2 vUv;

void main(){
    vec2 uv = vUv*0.5+0.5;
    gl_FragColor = texture2D(source, uv).bgra;
}