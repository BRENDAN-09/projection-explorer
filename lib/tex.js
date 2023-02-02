/**
 * 
 * @param {WebGLRenderingContext} gl 
 * @param {string} path
 * @param {WebGLTexture} cubeMap
 * @param {number} textureUnit
 */

let cube = new Float32Array([
    -1,-1,-1,
    -1,1,-1,
    -1,-1,1,//1
    -1,1,-1,
    -1,-1,1,
    -1,1,1,//2
    -1,1,-1,
    -1,1,1,
    1,1,-1,//3
    1,1,-1,
    1,1,1,
    -1,1,1,//4
    -1,1,1,
    -1,-1,1,
    1,-1,1,//5
    1,-1,1,
    -1,1,1,
    1,1,1,//6
    1,1,1,
    1,1,-1,
    1,-1,1,//7
    1,-1,1,
    1,1,-1,
    1,-1,-1,//8
    1,-1,-1,
    1,-1,1,
    -1,-1,1,//9
    -1,-1,1,
    1,-1,-1,
    -1,-1,-1,//1-1
    -1,-1,-1,
    1,-1,-1,
    -1,1,-1,//11
    -1,1,-1,
    1,1,-1,
    1,-1,-1 //12
  ])


function loadCube(gl,path,cubeMap, textureUnit){
    
    let faces = [
        {target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, path: path + "/right.jpg"},
        {target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, path: path + "/left.jpg"},
        {target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, path: path + "/front.jpg"},
        {target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, path: path + "/back.jpg"},
        {target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, path: path + "/up.jpg"},
        {target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, path: path + "/down.jpg"}
    ]
    for(let i = 0; i < faces.length; i++){
        //gl.texImage2D(faces[i].target, 0, gl.RGBA, 1024, 1024, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
        
        let image = document.createElement("img")
        image.src = faces[i].path
        image.onload = () => {
            gl.activeTexture(textureUnit)
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap)
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
            gl.texImage2D(faces[i].target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
            console.log(image.src + " LOADED!")
        }
    }
}

/**
 * 
 * @param {WebGLRenderingContext} gl 
 * @param {number} textureUnit
 * @param {number} fov
 */
async function bg(gl,textureUnit,fov){
    let pos = new Float32Array([
        -1, 1,
        1,1,
        1,-1,
        1,-1,
        -1,-1,
        -1, 1
    ])
    

    let bg = {
        program: await shadyMan.initProgram(gl, "./resources/bg.vsh", "./resources/bg.fsh"),
        positionBuffer: gl.createBuffer(),
        uniformObjects: {},
        attributeObjects: {}
    }
    bg.attributeObjects.position = {location: gl.getAttribLocation(bg.program, "POSITION")}

    gl.bindBuffer(gl.ARRAY_BUFFER, bg.positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, cube, gl.STATIC_DRAW)
    bg.uniformObjects.envMap = {value: textureUnit,location: gl.getUniformLocation(bg.program, "map")}
    bg.uniformObjects.mMatrix = {location: gl.getUniformLocation(bg.program, "mMatrix")}
    bg.uniformObjects.pMatrix = {location: gl.getUniformLocation(bg.program, "pMatrix")}
    return bg
    
}


/**
 * Hello gsdlhfsldjhflskdf
 * @param {WebGLRenderingContext} gl 
 * @param {bgObject} bg 
 * @param {Array} matrix
 */
function drawBg(gl,bg, mMatrix, pMatrix){
    gl.useProgram(bg.program)
    gl.disable(gl.DEPTH_TEST)
    gl.bindBuffer(gl.ARRAY_BUFFER,bg.positionBuffer)
    gl.uniformMatrix4fv(bg.uniformObjects.mMatrix.location, false, mMatrix)
    gl.uniformMatrix4fv(bg.uniformObjects.pMatrix.location, false, pMatrix)
    gl.uniform1i(bg.uniformObjects.envMap.location, bg.uniformObjects.envMap.value)
    gl.vertexAttribPointer(bg.attributeObjects.position.location,3,gl.FLOAT,false,0,0)
    gl.enableVertexAttribArray(bg.attributeObjects.position.location)

    gl.drawArrays(gl.TRIANGLES, 0, 36)
    gl.enable(gl.DEPTH_TEST)
}