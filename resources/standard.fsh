precision mediump float;

varying vec2 vUv;
varying vec3 vNormal;
varying vec2 vUv1;

uniform sampler2D map;
uniform sampler2D shadow;


void main() {
  vec4 base = texture2D(map, vUv);
  vec4 shad = texture2D(shadow, vUv1);
  if(base.a < 0.5){
   discard;
  }
  gl_FragColor = vec4(base.rgb*shad.rgb,1.);
}
