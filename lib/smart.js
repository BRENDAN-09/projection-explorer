let GL = {
  /**
  Returns a promise that resolve to a string with the requested URL
  @param{String}
  **/
  loadString: async function (url){
    return (await fetch(url)).text()
  },
  /**
  loads a ShaderObject from two URL's
  @param{String}
  @param{String}
  **/
  loadProgramfromPaths: async function (gl,vertPath, fragPath){
    let vertProm = this.loadString(vertPath)
    let fragProm = this.loadString(fragPath)

    let [vsSource, fsSource] = await Promise.all([vertProm,fragProm])

    return this.loadProgram(gl,vsSource, fsSource)
  },
  /**
  loads a ShaderObject from the vert shader string and frag shader string
  @param{String}
  @param{String}
  **/
  loadProgram: function (gl,vsSource, fsSource){
    let prgObj = {uniforms:{},attributes:{}}
    let vertexShader = this.loadShader(gl,gl.VERTEX_SHADER,vsSource)
    let fragmentShader = this.loadShader(gl,gl.FRAGMENT_SHADER,fsSource)

    prgObj.prg = gl.createProgram();
    gl.attachShader(prgObj.prg, vertexShader);
    gl.attachShader(prgObj.prg, fragmentShader);
    gl.linkProgram(prgObj.prg);

    // check for linking errors
    if (!gl.getProgramParameter(prgObj.prg, gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }

    let attDecs = vsSource.match(/attribute(\s)*(\w)*(\s)*(\w)*/g)
    let uniDecsV =  vsSource.match(/uniform(\s)*(\w)*(\s)*(\w)*/g)
    let uniDecsF =  fsSource.match(/uniform(\s)*(\w)*(\s)*(\w)*/g)

    let uniDecs = uniDecsV.concat(uniDecsF)

    for(let i = 0; i < uniDecs.length; i++){
      let matches = uniDecs[i].match(/(\w)+/g)
      if(matches.length != 3)console.error("Unable to infer uniforms" + uniDecs[i])
      let [, type, name] = matches
      prgObj.uniforms[name] = {
        type: type,
        location: gl.getUniformLocation(prgObj.prg, name)
      }
    }
    for(let i = 0; i < attDecs.length; i++){
      let matches = attDecs[i].match(/(\w)+/g)
      if(matches.length != 3)console.error("Unable to infer attributes" + attDecs[i])
      let [, type, name] = matches
      prgObj.attributes[name] = {
        type: type,
        location: gl.getAttribLocation(prgObj.prg, name)
      }
    }
    return prgObj;
  },

  clonePrg: function(prgObj){
    let newPrg = {prg: prgObj.prg, attributes:{}, uniforms:{}}
    newPrg.prg = prgObj.prg

    let copy = function (p){for(let i in prgObj[p]){
      newPrg[p][i] = {}
      for(let j in prgObj[p][i]){
        if(newPrg[p][i][j] instanceof Array){
          newPrg[p][i][j] = []
          for(let z = 0; z < newPrg[p][i][j].length; z++){
            newPrg[p][i][j][z] = prgObj[p][i][j][z]
          }
        }else{
          newPrg[p][i][j] = prgObj[p][i][j]
        }

      }
    }}


    copy("uniforms")
    copy("attributes")
    return newPrg
  },


  loadShader: (gl, type, source) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    //check for compilation errors
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }
    return shader
  },

  createTexture: (gl, image, mipmaps = true, filter = null) => {
    let tex = gl.createTexture()
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    if(filter == null){
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    }else{
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
    }
    if(mipmaps) gl.generateMipmap(gl.TEXTURE_2D)
  },

  loadImage: async function(path) {
    let img = document.createElement("img")
    img.src = URL.createObjectURL(await (await fetch(path)).blob())

    return img
  },

  gltf: async function (gl,path,shadow){
      let gltf = await (await fetch(path)).json()
      console.log(gltf);

      gltf.uniformLocations = {}
      gltf.shadow = this.createTexture(gl,shadow)
      gltf.stdProgram = this.loadProgram(gl,this.shaderLib.stdVsh,this.shaderLib.stdFsh)
      gltf.flatProgram = this.loadProgram(gl,this.shaderLib.flatVsh,this.shaderLib.flatFsh)

      console.log(gltf.stdProgram);
      //gltf.uniformLocations["shadow"] = gl.getUniformLocation(gltf.stdProgram, "shadow")



      for(let i = 0; i < gltf.buffers.length; i++){
          gltf.buffers[i].fetchy = await fetch(gltf.buffers[i].uri)
          gltf.buffers[i].arrayBuffer = await (gltf.buffers[i].fetchy.clone()).arrayBuffer()
          gltf.buffers[i].blobby = await (gltf.buffers[i].fetchy.clone()).blob()
          let currBuffer = gl.createBuffer()
          gl.bindBuffer(gl.ARRAY_BUFFER, currBuffer)
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gltf.buffers[i].arrayBuffer), gl.STATIC_DRAW)
          gltf.buffers[i].webGLBuffer = currBuffer
      }



      let meshPromises = []


      for(let m = 0; m < gltf.meshes.length; m++){
          let mesh = gltf.meshes[m]
          //console.log(mesh.name)
          meshPromises.push(GL.loadGltfMesh(gl,mesh, gltf))
      }
      await Promise.all(meshPromises)
      return gltf
  },
  /**
   * Requires the gltf buffer to be bound to gl.ARRAY_BUFFER!!
   * @param {WebGLRenderingContext} gl
   * @param {object} mesh
   */
  gltfBufferLoad: function (gl, mesh, rotMat, cameraMat){
      gl.useProgram(mesh.prg.prg)
      let ti = 0
      let tname = ["TEXTURE0","TEXTURE1","TEXTURE3","TEXTURE4"]
      for(let i in mesh.prg.uniforms){
        let u = mesh.prg.uniforms[i]
        if(u.value === undefined)console.warn(`skipping undefined uniform ${i}`)
        if(u.type == "mat4"){
          gl.uniformMatrix4fv(mesh.programInfo.uniformObjects.pMatrix, false, u.value)
        }
        if(u.type == "sampler2D"){
          console.log(`assigning ${i} to ${tname[ti]}`);
          gl.activeTexture(gl[tname[ti]])
          gl.bindTexture(gl.TEXTURE_2D, u.value)
          gl.uniform1i(u.location,i)
          ti++
        }
      }
      /*gl.uniformMatrix4fv(mesh.programInfo.uniformObjects.pMatrix, false, cameraMat)
      gl.uniformMatrix4fv(mesh.programInfo.uniformObjects.mMatrix, false, rotMat)
      if(mesh.glIndexBuffer==undefined)return
      for(attribute in mesh.programInfo.attributeObjects){
          let attribObj = mesh.programInfo.attributeObjects[attribute]
          gl.vertexAttribPointer(attribObj.location,attribObj.size,attribObj.type,false,attribObj.stride,attribObj.byteOffset)
          gl.enableVertexAttribArray(attribObj.location)
      }
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, mesh.programInfo.uniformObjects["map"].value)
      gl.uniform1i(mesh.programInfo.uniformObjects["map"].location,0)
      if(!mesh.flat){
          gl.activeTexture(gl.TEXTURE1)
          gl.bindTexture(gl.TEXTURE_2D, mesh.programInfo.uniformObjects["shadow"].value)
          gl.uniform1i(mesh.programInfo.uniformObjects["shadow"].location,1)
      }


      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.glIndexBuffer)*/
  },


  loadGltfMesh: async function(gl, mesh, gltf){


      let prim = mesh.primitives[0]
      mesh.flat = prim.attributes.TEXCOORD_1 == undefined
      mesh.prg = mesh.flat?this.clonePrg(gltf.flatProgram):this.clonePrg(gltf.stdProgram)
      mesh.count = gltf.accessors[prim.indices].count

      if(gltf.materials[prim.material].pbrMetallicRoughness.baseColorTexture === undefined){
          console.warn(`Skipping ${mesh.name}`)
          return
      }
      //console.log("LOADING TEXTURES");
      let texBufferView = gltf.bufferViews[gltf.images[gltf.textures[gltf.materials[prim.material].pbrMetallicRoughness.baseColorTexture.index].source].bufferView]
      let imgData = gltf.buffers[texBufferView.buffer].blobby
          .slice(texBufferView.byteOffset,texBufferView.byteOffset+texBufferView.byteLength)




      let image = document.createElement("img")
      image.src = URL.createObjectURL(imgData)
      mesh.prg.uniforms.map.value = this.createTexture(gl,image)




      // image.onload = function(){
      //     mesh.map = gl.createTexture()
      //     gl.bindTexture(gl.TEXTURE_2D, mesh.map)
      //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this)
      //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,gl.LINEAR)
      //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR)
      //
      //     gl.generateMipmap(gl.TEXTURE_2D)
      //
      //     mesh.programInfo.uniformObjects.map = {
      //         location: gl.getUniformLocation(mesh.program, "map"),
      //         value: mesh.map
      //     }
      // }


      //console.log("LOADING ATTRIBS");
      for(attribute in prim.attributes){

          if(attribute != "POSITION"&&attribute != "NORMAL"&&attribute != "TEXCOORD_0"&& attribute!="TEXCOORD_1")continue
          //console.log(attribute);

          let accessor = gltf.accessors[prim.attributes[attribute]]

          let size = ({VEC2:2,VEC3:3,VEC4:4})[accessor.type]
          let bufferView = gltf.bufferViews[accessor.bufferView]

          if(attribute == "POSITION"){
            mesh.posArr = new Float32Array (gltf.buffers[bufferView.buffer].arrayBuffer
                .slice(bufferView.byteOffset,bufferView.byteOffset+bufferView.byteLength))
          }
          ////console.log(accessor);
          mesh.prg.attributes[attribute].properties = {
              size: size,
              type: gl.FLOAT,
              stride: 0,
              byteOffset: bufferView.byteOffset,
          }



      }



      //console.log("LOADING INDICIES");
      mesh.indexBufferView = gltf.bufferViews[gltf.accessors[prim.indices].bufferView]
      let indexData = gltf.buffers[mesh.indexBufferView.buffer].arrayBuffer
          .slice(mesh.indexBufferView.byteOffset,mesh.indexBufferView.byteOffset+mesh.indexBufferView.byteLength)

      mesh.indArr = new Uint16Array(indexData)


      mesh.glIndexBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.glIndexBuffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indArr, gl.STATIC_DRAW)
  },



  mat4: {
      perspective: (fov, aspect, near, far) => {
          var f = Math.tan(Math.PI * 0.5 - 0.5 * fov)
          var ri = 1.0 / (near - far)

          return [
              f / aspect, 0, 0, 0,
              0, f, 0, 0,
              0, 0, (near + far) * ri, -1,
              0, 0, near * far * ri * 2, 0
          ]

      },

      multiply: (matrixA, matrixB) => {
          //Since the matricies are transposed relative to specB matricies,
          //Iterate through columns in matrixA and rows in matrixB
          ans = new Float32Array(16)
          for (let i = 0; i < 4; i++) { //iterate through columns in A (colums in result)
              for (let j = 0; j < 4; j++) { //iterate through rows in B (rows in result)
                  let dot = 0
                  for (let k = 0; k < 4; k++) {
                      dot += matrixA[i + 4 * k] * matrixB[j * 4 + k]
                  }
                  ans[i + j * 4] = dot
              }
          }
          return ans
      },

      lookAt: (cameraPos, target) => {
          let v1v2 = new vec3(0, 0, 0)
          v1v2.copy(target)
          v1v2.sub(cameraPos)
          //console.log(v1v2);
          let v2 = new vec3(v1v2.x, 0, v1v2.z)
          v2.scale(1 / v2.length())
          let xRot = [
              -v2.z, 0, -v2.x, 0,
              0, 1, 0, 0,
              v2.x, 0, -v2.z, 0,
              0, 0, 0, 1
          ]

          v1v2.apply(xRot)
          v1v2.scale(1 / v1v2.length())
          //console.log(v1v2);
          let yRot = [
              1, 0, 0, 0,
              0, Math.abs(v1v2.z), -v1v2.y, 0,
              0, v1v2.y, Math.abs(v1v2.z), 0,
              0, 0, 0, 1
          ]
          //console.log(xRot);
          let trans = [
              1, 0, 0, 0,
              0, 1, 0, 0,
              0, 0, 1, 0,
              -cameraPos.x, -cameraPos.y, -cameraPos.z, 1
          ]

          return mat4.multiply(mat4.multiply(yRot, xRot), trans)
      },

      fromRotation: (rot) => {
          let yRot = [
              Math.cos(rot.yRot), 0, Math.sin(rot.yRot), 0,
              0, 1, 0, 0,
              -Math.sin(rot.yRot), 0, Math.cos(rot.yRot), 0,
              0, 0, 0, 1
          ]
          let xRot = [
              1, 0, 0, 0,
              0, Math.cos(rot.xRot), -Math.sin(rot.xRot), 0,
              0, Math.sin(rot.xRot), Math.cos(rot.xRot), 0,
              0, 0, 0, 1
          ]
          let trans = [
              1, 0, 0, 0,
              0, 1, 0, 0,
              0, 0, 1, 0,
              -rot.pos.x, -rot.pos.y, -rot.pos.z, 1
          ]

          return mat4.multiply(mat4.multiply(xRot, yRot), trans)
      },

      fromRotation2: (rot) => {
          let yRot = [
              Math.cos(rot.yRot), 0, Math.sin(rot.yRot), 0,
              0, 1, 0, 0,
              -Math.sin(rot.yRot), 0, Math.cos(rot.yRot), 0,
              0, 0, 0, 1
          ]

          let xRot = [
              1, 0, 0, 0,
              0, Math.cos(rot.xRot), -Math.sin(rot.xRot), 0,
              0, Math.sin(rot.xRot), Math.cos(rot.xRot), 0,
              0, 0, 0, 1
          ]

          return mat4.multiply(yRot,xRot)
      },

      eye: () => [
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1
      ]
  },


  shaderLib: {
    stdVsh: `
    attribute vec4 POSITION;
    attribute vec3 NORMAL;
    attribute vec2 TEXCOORD_0;
    attribute vec2 TEXCOORD_1;


    uniform mat4 pMatrix;
    uniform mat4 mMatrix;

    varying vec2 vUv;
    varying vec2 vUv1;
    varying vec3 vNormal;


    void main() {
        vUv = TEXCOORD_0;
        vUv1 = TEXCOORD_1;
        vNormal = NORMAL;
        gl_Position = pMatrix * mMatrix * POSITION;
    }`,
    stdFsh: `
    precision mediump float;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec2 vUv1;

    uniform sampler2D map;
    uniform sampler2D shadow;


    void main() {
      vec4 base = texture2D(map, vUv);
      vec4 shad = texture2D(shadow, vUv1);
      if(base.a < 0.5){
        discard;
      }
      gl_FragColor = vec4(base.rgb*shad.rgb,1.);
    }`,
    flatVsh:`
    attribute vec4 POSITION;
    attribute vec3 NORMAL;
    attribute vec2 TEXCOORD_0;


    uniform mat4 pMatrix;
    uniform mat4 mMatrix;

    varying vec2 vUv;
    varying vec3 vNormal;


    void main() {
        vUv = TEXCOORD_0;
        vNormal = NORMAL;
        gl_Position = pMatrix * mMatrix * POSITION;
    }`,
    flatFsh:`
    precision mediump float;

    varying vec2 vUv;
    varying vec3 vNormal;

    uniform sampler2D map;


    void main() {
      vec4 base = texture2D(map, vUv);
      if(base.a < 0.5){
        discard;
      }
      gl_FragColor = vec4(base.rgb*0.3,1.);
    }`
  }
}
