const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');

let program;
let vao;
let texture;
let uTime, uMousePos, uTex2d;
let mouseX = 0;
let mouseY = 0;
const startTime = performance.now();

async function loadShader(url) {
    const res = await fetch(url);
    return res.text();
}

function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(vertSrc, fragSrc) {
    const vert = compileShader(gl.VERTEX_SHADER, vertSrc);
    const frag = compileShader(gl.FRAGMENT_SHADER, fragSrc);
    const prog = gl.createProgram();
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(prog));
        return null;
    }
    return prog;
}

function setupGeometry() {
    // interleaved layout: position (3 floats), color (3 floats), texcoord (2 floats)
    const vertices = new Float32Array([
        -0.75,  0.75, 0,   1, 1, 0,   0.0, 1.0,  // top-left
        -0.75, -0.75, 0,   1, 0, 0,   0.0, 0.0,  // bottom-left
         0.75, -0.75, 0,   0, 0, 1,   1.0, 0.0,  // bottom-right
         0.75,  0.75, 0,   0, 1, 0,   1.0, 1.0,  // top-right
    ]);
    const indices = new Uint32Array([0, 1, 2, 3]);
    const stride = 8 * 4; // 8 floats * 4 bytes each

    const quadVao = gl.createVertexArray();
    gl.bindVertexArray(quadVao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // aVertexPosition        (location 0)
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);

    // aVertexColor           (location 1)
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 3 * 4);

    // aVertexTextureCoordinates (location 2)
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, stride, 6 * 4);

    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
    return quadVao;
}

function loadTexture(url) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    // placeholder magenta pixel while image loads
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));

    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    };
    image.src = url;
    return tex;
}

function render() {
    const elapsed = (performance.now() - startTime) / 1000.0;

    gl.clearColor(0.392, 0.584, 0.929, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uTex2d, 0);
    gl.uniform1f(uTime, elapsed);
    gl.uniform2f(uMousePos, mouseX, mouseY);

    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_INT, 0);
    gl.bindVertexArray(null);

    requestAnimationFrame(render);
}

async function main() {
    if (!gl) {
        console.error('WebGL2 is not supported in this browser.');
        return;
    }

    canvas.width  = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX =  ((e.clientX - rect.left) / rect.width)  * 2.0 - 1.0;
        mouseY = 1.0 - ((e.clientY - rect.top)  / rect.height) * 2.0;
    });

    const [vertSrc, fragSrc] = await Promise.all([
        loadShader('shaders/01_hello_quad.vert'),
        loadShader('shaders/01_hello_quad.frag'),
    ]);

    program  = createProgram(vertSrc, fragSrc);
    uTime     = gl.getUniformLocation(program, 'uTime');
    uMousePos = gl.getUniformLocation(program, 'uMousePos');
    uTex2d    = gl.getUniformLocation(program, 'uTex2d');

    vao     = setupGeometry();
    texture = loadTexture('assets/paint_me.png');

    requestAnimationFrame(render);
}

main();
