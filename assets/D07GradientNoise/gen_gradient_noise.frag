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

uniform float uZ;
uniform int   uPattern;

// Period of the noise lattice. Texture coordinates [0,1] map to one full
// period of the noise so the generated texture tiles seamlessly when wrapped.
const float BASE_PERIOD = 4.0;
const int   OCTAVES     = 4;

// size 64, repeated once so chained lookups (perm[perm[x]+y]) never go out of bounds
const int permutations[128] = int[](
    27, 33, 14, 52, 24, 36, 46, 40, 26, 7, 49, 57, 59, 2, 42, 61, 9, 3, 12, 63, 37, 53, 17, 8, 44, 35, 30, 22, 6, 18, 60, 55, 31, 13, 21, 5, 47, 25, 38, 28, 32, 45, 43, 48, 23, 58, 62, 41, 11, 29, 34,
    54, 0, 1, 20, 19, 16, 4, 15, 50, 10, 39, 56, 51, 27, 33, 14, 52, 24, 36, 46, 40, 26, 7, 49, 57, 59, 2, 42, 61, 9, 3, 12, 63, 37, 53, 17, 8, 44, 35, 30, 22, 6, 18, 60, 55, 31, 13, 21, 5, 47, 25,
    38, 28, 32, 45, 43, 48, 23, 58, 62, 41, 11, 29, 34, 54, 0, 1, 20, 19, 16, 4, 15, 50, 10, 39, 56, 51);

// 12 fixed gradient directions (cube edge midpoints) cycled via the permutation table
const vec3 gradients[12] = vec3[12](
    vec3(1, 1, 0), vec3(-1, 1, 0), vec3(1, -1, 0), vec3(-1, -1, 0), vec3(1, 0, 1), vec3(-1, 0, 1), vec3(1, 0, -1), vec3(-1, 0, -1), vec3(0, 1, 1), vec3(0, -1, 1), vec3(0, 1, -1), vec3(0, -1, -1));

int perm(int i)
{
    return permutations[i & 127];
}

float gradientDot(int hash, vec3 p)
{
    return dot(gradients[hash % 12], p);
}

vec3 quintic(vec3 t)
{
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

// Improved 3D Perlin gradient noise, periodic with the given period in each axis,
// returns a value in roughly [-1, 1]
float gradientNoise(vec3 p, float period)
{
    vec3 cell0  = mod(floor(p), period);
    vec3 cell1  = mod(cell0 + 1.0, period);
    vec3 frac0  = fract(p);
    vec3 frac1  = frac0 - 1.0;
    vec3 weight = quintic(frac0);

    int x0 = int(cell0.x), x1 = int(cell1.x);
    int y0 = int(cell0.y), y1 = int(cell1.y);
    int z0 = int(cell0.z), z1 = int(cell1.z);

    int px0 = perm(x0);
    int px1 = perm(x1);

    int pxy00 = perm(px0 + y0);
    int pxy10 = perm(px1 + y0);
    int pxy01 = perm(px0 + y1);
    int pxy11 = perm(px1 + y1);

    float n000 = gradientDot(perm(pxy00 + z0), vec3(frac0.x, frac0.y, frac0.z));
    float n100 = gradientDot(perm(pxy10 + z0), vec3(frac1.x, frac0.y, frac0.z));
    float n010 = gradientDot(perm(pxy01 + z0), vec3(frac0.x, frac1.y, frac0.z));
    float n110 = gradientDot(perm(pxy11 + z0), vec3(frac1.x, frac1.y, frac0.z));
    float n001 = gradientDot(perm(pxy00 + z1), vec3(frac0.x, frac0.y, frac1.z));
    float n101 = gradientDot(perm(pxy10 + z1), vec3(frac1.x, frac0.y, frac1.z));
    float n011 = gradientDot(perm(pxy01 + z1), vec3(frac0.x, frac1.y, frac1.z));
    float n111 = gradientDot(perm(pxy11 + z1), vec3(frac1.x, frac1.y, frac1.z));

    float nx00 = mix(n000, n100, weight.x);
    float nx10 = mix(n010, n110, weight.x);
    float nx01 = mix(n001, n101, weight.x);
    float nx11 = mix(n011, n111, weight.x);

    float nxy0 = mix(nx00, nx10, weight.y);
    float nxy1 = mix(nx01, nx11, weight.y);

    return mix(nxy0, nxy1, weight.z);
}

// sum of octaves of gradient noise, each octave doubling frequency (and period to
// keep it tileable) while halving amplitude, range roughly [-1, 1]
float fractalSum(vec3 p)
{
    float total        = 0.0;
    float frequency    = 1.0;
    float amplitude    = 1.0;
    float maxAmplitude = 0.0;
    for (int i = 0; i < OCTAVES; ++i)
    {
        total += gradientNoise(p * frequency, BASE_PERIOD * frequency) * amplitude;
        maxAmplitude += amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return total / maxAmplitude;
}

// sum of absolute value of octaves, gives a turbulent / cloud-like look, range [0, 1]
float turbulence(vec3 p)
{
    float total        = 0.0;
    float frequency    = 1.0;
    float amplitude    = 1.0;
    float maxAmplitude = 0.0;
    for (int i = 0; i < OCTAVES; ++i)
    {
        total += abs(gradientNoise(p * frequency, BASE_PERIOD * frequency)) * amplitude;
        maxAmplitude += amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return total / maxAmplitude;
}

// turbulence used to perturb a sine wave to create veins of marble, range [0, 1]
float marblePattern(vec3 p)
{
    const float PI = 3.14159265359;
    float       v  = sin((p.x + p.y) * PI + turbulence(p) * 6.0);
    return v * 0.5 + 0.5;
}

// turbulence used to perturb concentric rings to create wood grain, range [0, 1]
float woodPattern(vec3 p)
{
    vec2  centered = p.xy - BASE_PERIOD * 0.5;
    float rings    = length(centered) * 4.0 + turbulence(p) * 4.0;
    return fract(rings);
}

void main()
{
    vec3 p = vec3(vTextureCoordinates * BASE_PERIOD, uZ);

    float value;
    if (uPattern == 0) // Plain Gradient Noise, remapped from [-1,1] to [0,1]
    {
        value = gradientNoise(p, BASE_PERIOD) * 0.5 + 0.5;
    }
    else if (uPattern == 1) // Fractal Sum, remapped from [-1,1] to [0,1]
    {
        value = fractalSum(p) * 0.5 + 0.5;
    }
    else if (uPattern == 2) // Turbulence, already in [0,1]
    {
        value = turbulence(p);
    }
    else if (uPattern == 3) // Marble
    {
        value = marblePattern(p);
    }
    else // Wood
    {
        value = woodPattern(p);
    }

    fFragmentColor = vec4(vec3(clamp(value, 0.0, 1.0)), 1.0);
}
