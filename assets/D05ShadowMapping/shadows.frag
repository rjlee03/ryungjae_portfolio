#version 300 es
precision       highp float;
precision highp sampler2DShadow;

/**
 * \file
 * \author Rudy Castan
 * \author Ryungjae Lee
 * \date 2026 Spring
 * \par CS250 Computer Graphics II
 * \copyright DigiPen Institute of Technology
 */

layout(location = 0) out vec4 fFragmentColor;

in vec3 vNormalInViewSpace;
in vec3 vPositionInViewSpace;
in vec4 vPositionInShadowSpace;

uniform sampler2DShadow uShadowMap;

uniform vec3  uFogColor;
uniform float uFogDensity;
uniform vec3  uDiffuse;
uniform vec3  uAmbient;
uniform float uShininess;
uniform vec3  uSpecularColor;
uniform vec3  uLightPosition;
uniform bool  uDoShadowBehindLight;

void main()
{
    vec3       n    = normalize(vNormalInViewSpace);
    vec3       l    = normalize(uLightPosition - vPositionInViewSpace);
    float      nl   = max(dot(n, l), 0.0f);
    const vec3 eye  = vec3(0, 0, 1);
    vec3       h    = normalize(l + eye);
    float      spec = max(0.0f, dot(n, h));
    spec            = pow(spec, uShininess);
    vec3 diffuse    = nl * uDiffuse;

    float shadow = textureProj(uShadowMap, vPositionInShadowSpace);

    if (!uDoShadowBehindLight && vPositionInShadowSpace.z < 0.0)
        shadow = 1.0;

    vec3 color = uAmbient + shadow * (diffuse + spec * uSpecularColor);
    color      = pow(color, vec3(1.0f / 2.2f));

    float dist      = length(vPositionInViewSpace);
    float fogAmount = 1.0 - exp(-uFogDensity * dist);
    fFragmentColor  = vec4(mix(color, uFogColor, fogAmount), 1.0f);
}
