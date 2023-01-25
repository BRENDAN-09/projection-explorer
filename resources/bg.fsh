precision mediump float;
varying vec3 vNormal;

uniform samplerCube map;


void main() {
  gl_FragColor = vec4(textureCube(map,vNormal).rgb,1.);
}
