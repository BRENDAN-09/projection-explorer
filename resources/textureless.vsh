attribute vec4 POSITION;
attribute vec3 NORMAL;\


uniform mat4 pMatrix;
uniform mat4 mMatrix;
varying vec3 vNormal;


void main() {
    vNormal = NORMAL;
    gl_Position = pMatrix * mMatrix * POSITION;
}