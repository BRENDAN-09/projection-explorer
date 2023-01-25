/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {string} path
 */

async function gltfLoad(gl, path, shadow) {
    let gltf = await (await fetch(path)).json()

    gltf.uniformLocations = {}
    gltf.shadow = gl.createTexture()
    gltf.stdProgram = await shadyMan.initProgram(gl, "./resources/standard.vsh", "./resources/standard.fsh")
    gltf.flatProgram = await shadyMan.initProgram(gl, "./resources/flat.vsh", "./resources/flat.fsh")
    gltf.texturelessProgram = await shadyMan.initProgram(gl, "./resources/textureless.vsh", "./resources/textureless.fsh")
    gltf.uniformLocations["shadow"] = gl.getUniformLocation(gltf.stdProgram, "shadow")

    for (let i = 0; i < gltf.buffers.length; i++) {
        gltf.buffers[i].fetchy = await fetch(gltf.buffers[i].uri)
        gltf.buffers[i].arrayBuffer = await (gltf.buffers[i].fetchy.clone()).arrayBuffer()
        gltf.buffers[i].blobby = await (gltf.buffers[i].fetchy.clone()).blob()
        let currBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, currBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gltf.buffers[i].arrayBuffer), gl.STATIC_DRAW)
        gltf.buffers[i].webGLBuffer = currBuffer
    }

    let meshPromises = []

    let shadowImg = document.createElement("img")
    shadowImg.src = shadow

    shadowImg.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, gltf.shadow)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
        gl.generateMipmap(gl.TEXTURE_2D)
    }

    for (let m = 0; m < gltf.meshes.length; m++) {
        let mesh = gltf.meshes[m]
        meshPromises.push(loadGltfMesh(mesh, gltf))
    }
    await Promise.all(meshPromises)
    console.log(gltf);

    return gltf
}

/**
 * Requires the gltf buffer to be bound to gl.ARRAY_BUFFER!!
 * @param {WebGLRenderingContext} gl
 * @param {object} mesh
 */
function gltfBufferLoad(gl, mesh, rotMat, cameraMat, program_obj) {
    let program, programInfo
    if (program_obj != undefined) {
        program = program_obj.program
        programInfo = program_obj
    } else {
        program = mesh.program
        programInfo = mesh.programInfo
    }

    gl.useProgram(program)
    gl.uniformMatrix4fv(programInfo.uniformObjects.pMatrix, false, cameraMat)
    gl.uniformMatrix4fv(programInfo.uniformObjects.mMatrix, false, rotMat)

    if (mesh.glIndexBuffer == undefined) return
    for (attribute in programInfo.attributeObjects) {
        let attribObj = programInfo.attributeObjects[attribute]
        gl.vertexAttribPointer(attribObj.location, attribObj.size, attribObj.type, false, attribObj.stride, attribObj.byteOffset)
        gl.enableVertexAttribArray(attribObj.location)
    }
    if (programInfo.uniformObjects.map !== undefined) {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, programInfo.uniformObjects["map"].value)
        gl.uniform1i(programInfo.uniformObjects["map"].location, 0)
    }
    if(mesh.mat_type=="simple"){
        //do nothing
    }else if (!mesh.flat) {
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, programInfo.uniformObjects["shadow"].value)
        gl.uniform1i(programInfo.uniformObjects["shadow"].location, 1)
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.glIndexBuffer)
}


async function loadGltfMesh(mesh, gltf) {
    mesh.programInfo = {
        uniformObjects: {},
        attributeObjects: {}
    }

    let prim = mesh.primitives[0]
    if(gltf.materials[prim.material].pbrMetallicRoughness?.baseColorTexture !== undefined){
        mesh.mat_type = prim.attributes.TEXCOORD_1 == undefined ? "flat" : "baked"
        mesh.program = mesh.mat_type == "baked"?gltf.stdProgram:gltf.flatProgram; 
    }else if(gltf.materials[prim.material].pbrMetallicRoughness?.baseColorFactor !== undefined){
        mesh.mat_type = "simple"
        mesh.program = gltf.texturelessProgram
    }else{
        mesh.mat_type = "none"
        return;
    }
    //mesh.program = ({"baked": gltf.stdProgram, "flat": gltf.flatProgram, "simple": gltf.texturelessProgram})[mesh.mat_type]//mesh.flat ? gltf.flatProgram : gltf.stdProgram
    //console.log(mesh.mat_type, mesh.program);
    
    if(mesh.mat_type=="baked") mesh.programInfo.uniformObjects["shadow"] = { location: gltf.uniformLocations["shadow"], value: gltf.shadow }
    mesh.programInfo.uniformObjects["pMatrix"] = gl.getUniformLocation(mesh.program, "pMatrix")
    mesh.programInfo.uniformObjects["mMatrix"] = gl.getUniformLocation(mesh.program, "mMatrix")
    mesh.count = gltf.accessors[prim.indices].count
    if (prim.material === undefined) {
        console.warn(`Skipping ${mesh.name} (no material)`)
        return
    }

    if (mesh.mat_type=="baked"||mesh.mat_type=="flat") {
        let texBufferView = gltf.bufferViews[gltf.images[gltf.textures[gltf.materials[prim.material].pbrMetallicRoughness.baseColorTexture.index].source].bufferView]
        let imgData = gltf.buffers[texBufferView.buffer].blobby
            .slice(texBufferView.byteOffset, texBufferView.byteOffset + texBufferView.byteLength)




        let image = document.createElement("img")
        image.src = URL.createObjectURL(imgData)
        mesh.programInfo.uniformObjects.map = {}


        image.onload = function () {

            mesh.map = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, mesh.map)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)

            gl.generateMipmap(gl.TEXTURE_2D)

            mesh.programInfo.uniformObjects.map = {
                location: gl.getUniformLocation(mesh.program, "map"),
                value: mesh.map
            }
        }
    } else if (mesh.mat_type=="simple") {
        console.warn(`simple material`)
        mesh.mat_type = "simple"
        mesh.program = gltf.texturelessProgram
    } else {
        console.warn(`Skipping ${mesh.name} (too strange)`)
        return
    }



    for (attribute in prim.attributes) {

        if (attribute != "POSITION" && attribute != "NORMAL" && attribute != "TEXCOORD_0" && attribute != "TEXCOORD_1") continue

        let accessor = gltf.accessors[prim.attributes[attribute]]
        let size = ["VEC2", "VEC3", "VEC4"].findIndex(e => e == accessor.type) + 2
        let bufferView = gltf.bufferViews[accessor.bufferView]

        if (attribute == "POSITION") {
            mesh.posArr = new Float32Array(gltf.buffers[bufferView.buffer].arrayBuffer
                .slice(bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength))
        }
        mesh.programInfo.attributeObjects[attribute] = {
            location: gl.getAttribLocation(mesh.program, attribute),
            size: size,
            type: gl.FLOAT,
            stride: 0,
            byteOffset: bufferView.byteOffset,
        }



    }
    mesh.indexBufferView = gltf.bufferViews[gltf.accessors[prim.indices].bufferView]
    let indexData = gltf.buffers[mesh.indexBufferView.buffer].arrayBuffer
        .slice(mesh.indexBufferView.byteOffset, mesh.indexBufferView.byteOffset + mesh.indexBufferView.byteLength)

    mesh.indArr = new Uint16Array(indexData)


    mesh.glIndexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.glIndexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indArr, gl.STATIC_DRAW)
}
