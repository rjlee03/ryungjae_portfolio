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
layout(location = 1) in vec3 aVertexNormal;
layout(location = 2) in vec2 aVertexTextureCoordinates;

out vec2 vTextureCoordinates;

uniform mat4  uModelMatrix;
uniform mat4  uViewMatrix;
uniform mat4  uProjection;
uniform float uTileScale;

uniform sampler2D uTexture;

void main()
{
    vTextureCoordinates = aVertexTextureCoordinates * uTileScale;

    float height             = textureLod(uTexture, vTextureCoordinates, 0.0).r;
    vec3  displaced_position = aVertexPosition + aVertexNormal * height;

    gl_Position = uProjection * uViewMatrix * uModelMatrix * vec4(displaced_position, 1.0);
}
