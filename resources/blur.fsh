precision highp float;

uniform sampler2D source;
uniform sampler2D depth;
uniform float threshold;
varying vec2 vUv;

void main(){
    vec3 finalCol = vec3(0.);
    for(int i = 0; i < 20; i ++){
        finalCol += texture2D(source, (vUv * (1.-float(i)/50.) )/2.+vec2(0.5,0.5)).rgb;
    }
    finalCol = finalCol / 10.;
    gl_FragColor = vec4((finalCol.rgb), 1.);//texture2D(source, vUv/2.+vec2(0.5,0.5));
}