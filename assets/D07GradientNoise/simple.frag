#version 300 es
precision highp float;

/**
 * \file
 * \author Rudy Castan
 * \author Ryungjae Lee
 * \date 2026 Spring
 * \par CS250 Computer Graphics II
 * \copyright DigiPen Institute of Technology
 */

in vec2 vTextureCoordinates;

layout(location = 0) out vec4 fFragmentColor;

uniform sampler2D uTexture;

void main()
{
    float value    = texture(uTexture, vTextureCoordinates).r;
    fFragmentColor = vec4(vec3(value), 1.0);
}
