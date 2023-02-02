/**@type {HTMLCanvasElement} */
let canvas = document.getElementById("canvas")
let gl = canvas.getContext("webgl")

let modes = [
    {id: "mercator", name: "Mercator Projection", shader: "shader/mercator.fs"},
    {id: "mollweide", name: "Mollweide Projection", shader: "shader/mollweide.fs"},
    {id: "sinosoidal", name: "Sinosoidal Projection", shader: "shader/sinosoidal.fs"},
    {id: "cylinder", name: "Cylindrical Projection", shader: "shader/dumb.fs"},
    {id: "equirectangular", name: "Equirectangular projection", shader: "shader/equi.fs"},
    {id: "azimuth", name: "Lambert azimuthal equal-area projection", shader: "shader/azimuthal.fs"},
    {id: "lambert", name: "Lambert cylindrical projection", shader: "shader/cylinder.fs"},
    {id: "stereo", name: "Stereographic Projection", shader: "shader/stereo.fs"}
    //{id: "conic", name: "Conic fun fun", shader: "shader/conic.fs"}
]
let mode = 0
let geoData = new Float32Array([-1,-1,-1,1,1,-1,1, 1,1,-1,-1,1])

let cylinder = {uniforms: {},attributes: {}}
let sphere = {uniforms: {},attributes: {}}
let w, h, cylinder_vp, sphere_vp
let mousedown = false, revolving = 0
let rotation
window.onresize = handle_resize
start()

async function start() {
    console.log("started")
    gl.clearColor(0, 0, 0, 1)

    await init_projector()
    sphere.program =  await shadyMan.initProgram(gl, "shader/basic.vs", "shader/sphere.fs", false)

    sphere.attributes.position = gl.getAttribLocation(sphere.program, "POSITION")
    sphere.uniforms.map = gl.getUniformLocation(sphere.program, "map")
    sphere.uniforms.rotation = gl.getUniformLocation(sphere.program, "ROTATION")
    
    let map = gl.createTexture()
    loadCube(gl, "resources/globe", map, gl.TEXTURE0)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, geoData, gl.STATIC_DRAW)
    gl.vertexAttribPointer(cylinder.attributes.position, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(cylinder.attributes.position)

    gl.vertexAttribPointer(sphere.attributes.position, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(sphere.attributes.position)

    
    gl.useProgram(sphere.program)
    gl.uniform1i(sphere.uniforms.map,0)
    gl.uniformMatrix3fv(sphere.uniforms.rotation, false, rotation.toMatrix())

    document.getElementById("loading").remove()
    setTimeout(()=>document.getElementById("info").classList.add("info_gone"), 8000);
    setTimeout(()=>document.getElementById("info").remove(), 10000);
    render()
}

function render(){
    let rot = Quaternion.fromAxisAngle([0,0,1],revolving/100)
    rotation = rot.mul(rotation)
    gl.useProgram(cylinder.program)
    gl.viewport(...cylinder_vp)
    gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT)
    gl.uniformMatrix3fv(cylinder.uniforms.rotation, false, rotation.toMatrix())
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    gl.viewport(...sphere_vp)
    gl.useProgram(sphere.program)
    gl.uniformMatrix3fv(sphere.uniforms.rotation, false, rotation.toMatrix())
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    requestAnimationFrame(render)
}


function handle_resize(){
    
    w = canvas.width = window.innerWidth
    h = canvas.height = window.innerHeight
    let globe_size = Math.min(w,h)/5
    let mode_id = modes[mode].id
    if(mode_id == "lambert"){
        let s = Math.min(w, h*Math.PI)
        cylinder_vp = [(w-s)/2, (h-s/Math.PI)/2, s, s/Math.PI]
        sphere_vp = [(w-s)/2,(h-s/Math.PI)/2,globe_size,globe_size]
    }

    if(mode_id == "equirectangular" || mode_id == "sinosoidal" || mode_id == "mollweide"){
        let s = Math.min(w, h*2)
        cylinder_vp = [(w-s)/2, (h-s/2)/2, s, s/2]
        sphere_vp = [(w-s)/2,(h-s/2)/2,globe_size,globe_size]
    }

    if(mode_id == "cylinder" || mode_id == "mercator" ||  mode_id == "stereo" ){
        cylinder_vp = [0,0,w,h]
        sphere_vp = [0,0,globe_size,globe_size]
    }

    if(mode_id == "azimuth" || mode_id == "conic"){
        let s = Math.min(w, h)
        cylinder_vp = [(w-s)/2, (h-s)/2, s, s]
        sphere_vp = [(w-s)/2,(h-s)/2,globe_size,globe_size]
    }

    let old_program = gl.getParameter(gl.CURRENT_PROGRAM)
    gl.useProgram(cylinder.program)
    gl.uniform1f(cylinder.uniforms.w_over_h, w/h);
    gl.useProgram(old_program)
    
}

function handle_mousemove(e){
    if(!mousedown)return
    let rot_east = Quaternion.fromAxisAngle([0,1,0], -(e.movementX/w)*Math.PI*2)
    rotation = rot_east.mul(rotation)
    let rot_north = Quaternion.fromAxisAngle([1,0,0],-(e.movementY/h)*Math.PI*2)
    rotation = rot_north.mul(rotation)
}
window.addEventListener("mousedown",()=>{mousedown=true})
window.addEventListener("mouseup", ()=>{mousedown=false})
window.addEventListener("touchstart",()=>{mousedown=true})
window.addEventListener("touchend", ()=>{mousedown=false})
window.addEventListener("mousemove", handle_mousemove)
window.addEventListener("touchmove", handle_mousemove)

let increment_mode = () => {mode = mode<modes.length-1?mode+1:0; init_projector()}
let decrement_mode = () => {mode = mode>0?mode-1:modes.length-1; init_projector()}

async function init_projector(){
    rotation = Quaternion.fromAxisAngle([0,1,0],Math.PI/2.0)
    cylinder = {uniforms: {},attributes: {}}
    cylinder.program = await shadyMan.initProgram(gl, "shader/basic.vs", modes[mode].shader, false)
    cylinder.attributes.position = gl.getAttribLocation(cylinder.program, "POSITION")
    cylinder.uniforms.map = gl.getUniformLocation(cylinder.program, "map")
    cylinder.uniforms.rotation = gl.getUniformLocation(cylinder.program, "ROTATION")
    cylinder.uniforms.w_over_h = gl.getUniformLocation(cylinder.program, "w_over_h")
    gl.useProgram(cylinder.program)
    gl.uniform1i(cylinder.uniforms.map,0)
    gl.uniformMatrix3fv(cylinder.uniforms.rotation, false, rotation.toMatrix())

    document.getElementById("dist").innerHTML = modes[mode].name
    handle_resize()
}
