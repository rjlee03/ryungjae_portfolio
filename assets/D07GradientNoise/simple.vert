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

layout(location = 0) in vec3 aVertexPosition;
// layout(location = 1) in vec3 aVertexNormal;
layout(location = 2) in vec2 aVertexTextureCoordinates;

out vec2 vTextureCoordinates;

uniform mat4  uProjection;
uniform float uTileScale;

void main()
{
    gl_Position         = uProjection * vec4(aVertexPosition, 1.0);
    vTextureCoordinates = aVertexTextureCoordinates * uTileScale;
}
