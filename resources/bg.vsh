attribute vec4 POSITION;

uniform mat4 mMatrix;
uniform mat4 pMatrix;

varying vec3 vNormal;


void main() {
    vNormal = POSITION.xyz;
    gl_Position = pMatrix * vec4( (mMatrix * ( POSITION - vec4(0.,0.,0.,1.))).xyz,1.);
}
