#version 300 es
precision highp float;

/**
 * \file
 * \author Rudy Castan
 * \author Ryungjae Lee
 * \date 2025 Spring
 * \par CS250 Computer Graphics II
 * \copyright DigiPen Institute of Technology
 */

in vec3 vColor;
in vec2 vTextureCoordinates;

uniform sampler2D uTex2d;
uniform float     uTime;

layout(location = 0) out vec4 fFragmentColor;

void main()
{
    vec3  texColor = texture(uTex2d, vTextureCoordinates).rgb;
    float blend    = 0.5 + 0.5 * sin(uTime * 1.5);
    vec3  color    = mix(vColor, texColor, blend);

    float pulse    = 0.5 + 0.5 * sin(uTime * 1.5);
    vec3  tint     = vec3(
        0.5 + 0.5 * sin(uTime * 1.1),
        0.5 + 0.5 * sin(uTime * 1.3 + 2.094),
        0.5 + 0.5 * sin(uTime * 1.7 + 4.189)
    );
    color          = mix(color, tint, 0.3 * pulse);

    fFragmentColor = vec4(color, 1.0);
}
