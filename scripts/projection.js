/**@type {HTMLCanvasElement} */
let canvas = document.getElementById("canvas")
let gl = canvas.getContext("webgl")


let grid = document.createElement("img")
grid.src = "resources/map.jpg"
grid.onload = start

console.log(grid)


let geoData = new Float32Array([-1,-1,-1,1,1,-1,1, 1,1,-1,-1,1])
let cylinder = {uniforms: {},attributes: {}}
let sphere = {uniforms: {},attributes: {}}
let w, h, s
let mousedown = false;
window.onresize =handle_resize
handle_resize()

async function start() {
    console.log("started");
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1)

    cylinder.program = await shadyMan.initProgram(gl, "shader/basic.vs", "shader/cylinder.fs", false)
    sphere.program =  await shadyMan.initProgram(gl, "shader/basic.vs", "shader/sphere.fs", false)

    cylinder.attributes.position = gl.getAttribLocation(cylinder.program, "POSITION")
    cylinder.uniforms.map = gl.getUniformLocation(cylinder.program, "map")

    sphere.attributes.position = gl.getAttribLocation(sphere.program, "POSITION")
    sphere.uniforms.map = gl.getUniformLocation(sphere.program, "map")
    
    let map = gl.createTexture()
    loadCube(gl, "resources/globe", map, gl.TEXTURE0)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, geoData, gl.STATIC_DRAW)
    gl.vertexAttribPointer(cylinder.attributes.position, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(cylinder.attributes.position)

    gl.vertexAttribPointer(sphere.attributes.position, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(sphere.attributes.position)

    gl.useProgram(cylinder.program)
    gl.uniform1i(cylinder.uniforms.map,0)
    gl.useProgram(sphere.program)
    gl.uniform1i(sphere.uniforms.map,0)
    render()
}

let t = 0

function render(){
    t += 1
    gl.useProgram(cylinder.program)
    gl.viewport((w-s)/2, (h-s/Math.PI)/2, s, s/Math.PI)
    gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    gl.viewport((w-s)/2,(h-s/Math.PI)/2,s/8,s/8)
    gl.useProgram(sphere.program)
    //gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    requestAnimationFrame(render)
}


function handle_resize(){
    console.log("hi")
    s = Math.min(window.innerWidth, window.innerHeight*Math.PI)
    w = canvas.width = window.innerWidth
    h = canvas.height = window.innerHeight
}

canvas.addEventListener("mousedown",()=>{mousedown=true})
canvas.addEventListener("mouseup", ()=>{mousedown=false})

canvas.addEventListener("mousemove", (e)=>{
    
})