attribute vec4 POSITION;
attribute vec3 NORMAL;
attribute vec2 TEXCOORD_0;


uniform mat4 pMatrix;
uniform mat4 mMatrix;

varying vec2 vUv;
varying vec3 vNormal;


void main() {
    vUv = TEXCOORD_0;
    vNormal = NORMAL;
    gl_Position = pMatrix * mMatrix * POSITION;
}
