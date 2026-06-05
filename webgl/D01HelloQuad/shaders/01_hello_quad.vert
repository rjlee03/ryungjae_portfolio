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

layout(location = 0) in vec3 aVertexPosition;
layout(location = 1) in vec3 aVertexColor;
layout(location = 2) in vec2 aVertexTextureCoordinates;

uniform float uTime;
uniform vec2  uMousePos;

out vec3 vColor;
out vec2 vTextureCoordinates;

mat2 rotation(float angle)
{
    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, -s, s, c);
}

void main()
{
    float phase         = uTime * 0.7;
    float t             = sin(phase);
    float scale         = 0.25 + 0.4 * (0.5 + 0.5 * t);
    float angle         = -cos(phase) * 3.14159;
    vec2  pos2d         = rotation(angle) * (aVertexPosition.xy * scale);
    pos2d              += uMousePos;
    gl_Position         = vec4(pos2d, 0.0, 1.0);
    vColor              = aVertexColor;
    vTextureCoordinates = aVertexTextureCoordinates;
}
