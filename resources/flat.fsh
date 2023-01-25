precision mediump float;

varying vec2 vUv;
varying vec3 vNormal;

uniform sampler2D map;


void main() {
  vec4 base = texture2D(map, vUv);
  if(base.a < 0.5){
    discard;
  }
  gl_FragColor = vec4(base.rgb*0.3,1.);
}
