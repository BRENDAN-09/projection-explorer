attribute vec4 POSITION;
attribute vec3 NORMAL;
attribute vec2 TEXCOORD_0;
attribute vec2 TEXCOORD_1;


uniform mat4 pMatrix;
uniform mat4 mMatrix;

varying vec2 vUv;
varying vec2 vUv1;
varying vec3 vNormal;


void main() {
    vUv = TEXCOORD_0;
    vUv1 = TEXCOORD_1;
    vNormal = NORMAL;
    gl_Position = pMatrix * mMatrix * POSITION;
}
