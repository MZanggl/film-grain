export const mainGLSL = `attribute vec4 position;

void main() {
	gl_Position = position;
}`;

export const filmGrainGLSL = `precision highp float;

// Normalizes a value between 0 - 1
float normFloat(float n, float minVal, float maxVal){
    return max(0.0, min(1.0, (n-minVal) / (maxVal-minVal)));
}

float hash(float n) {
 	return fract(cos(n*89.42)*343.42);
}

vec2 hash2(vec2 n) {
 	return vec2(hash(n.x*23.62-300.0+n.y*34.35),hash(n.x*45.13+256.0+n.y*38.89)); 
}

float worley(vec2 c, float time) {
    float dis = 1.0;
    for(int x = -1; x <= 1; x++)
        for(int y = -1; y <= 1; y++){
            vec2 p = floor(c)+vec2(x,y);
            vec2 a = hash2(p) * time;
            vec2 rnd = 0.5+sin(a)*0.5;
            float d = length(rnd+vec2(x,y)-fract(c));
            dis = min(dis, d);
        }
    return dis;
}

float worley2(vec2 c, float time) {
    float w = 0.0;
    for (int i = 0; i<2; i++) {
        w += worley(c, time);
        c*=2.0;
        time*=2.0;
    }
    w /= 2.0;
    return w;
}

float worley5(vec2 c, float time) {
    float w = 0.0;
    float a = 0.5;
    int i = 0;
    for (int i = 0; i<5; i++) {
        w += worley(c, time)*a;
        c*=2.0;
        time*=2.0;
        a*=0.5;
    }
    return w;
}

uniform vec3 color1;
uniform vec3 color2;
uniform vec2 resolution;
uniform float time;

void main() {
	vec2 uv = gl_FragCoord.xy / resolution;
	float centerDist = distance(uv, vec2(0.5, 0.5));

    // Random spots
    float spotNoise = worley5(uv * 4.0, time * 20.0);
    spotNoise = mix(-1.0, 17.0, spotNoise);
    float spots = clamp(spotNoise, 0.7, 1.0);

    // Vignette
    vec2 vigUV = uv * (1.0 - uv.yx);
    vigUV *= vec2(2.0, 2.0);
    float vigTime = sin(time * 3.0) * cos(time * 6.77);
    float vignette = vigUV.x * vigUV.y * 20.0;
    vignette = pow(vignette, 0.15 + vigTime * 0.03);
    vignette = clamp(vignette, 0.0, 1.0);

    // Random lines
    vec2 lineUV = uv * vec2(1000.0, 0.01);
    float lineNoise = worley2(lineUV, time * 5.0);
    float lines = mix(40.0, -0.5, lineNoise);
    lines = clamp(lines, 0.8, 1.0);

    // Grain
    float uvMult = (uv.x + 4.0 ) * (uv.y + 4.0 ) * (time * 10.0);
    float grain = (mod((mod(uvMult, 13.0) + 1.0) * (mod(uvMult, 123.0) + 1.0), 0.01)-0.005) * 16.0;
    grain = 1.0 - grain;

    float combined = vignette * lines * spots * grain;
    // combined = lines;
    vec3 finalColor = mix(color1, color2, combined);

	gl_FragColor.rgb = finalColor;
    // gl_FragColor.rgb = vec3(grain);
	gl_FragColor.a = 1.0;
}`;