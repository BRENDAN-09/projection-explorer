attribute vec4 position;

uniform mat4 pMatrix;
uniform mat4 mMatrix;

varying vec4 vCol;


void main() {
  vCol = position;
  gl_Position = pMatrix*( mMatrix* (position-vec4(0.5,0.5,0.5,0.)) );
}
