let shadyMan = {
  /**
   * 
   * @param {WebGLRenderingContext} gl 
   * @param {string} vsPath 
   * @param {string} fsPath
   * @param {boolean} makInfo 
   */
  initProgram: async function (gl,vsPath,fsPath, makeInfo){
    //fetch the appropriate files
    const vsPromise = fetch(vsPath)
    const fsPromise = fetch(fsPath)
  
    //await for the responses
    const [vsResponse, fsResponse] = await Promise.all([vsPromise, fsPromise])
    //decode the responses
    const [vsSource, fsSource] = await Promise.all([vsResponse.text(), fsResponse.text()])
  
  
    let vertexShader = shadyMan.loadShader(gl, gl.VERTEX_SHADER, vsSource)
    let fragmentShader = shadyMan.loadShader(gl, gl.FRAGMENT_SHADER, fsSource)
  
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
  
    // check for linking errors
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }


    if(!makeInfo) {
      return shaderProgram;
    }

    let programInfo = {
      program: shaderProgram,
      attributes: {},
      uniforms: {}
    }

    const combinedSource = vsSource + "\n\n" + fsSource;

    const attributeMatches = combinedSource.matchAll(new RegExp('attribute.*;', 'g'))
    for(const att of attributeMatches){
      const attName = att[0].split(" ")[2].slice(0,-1);
      programInfo.attributes[attName] = gl.getAttribLocation(shaderProgram, attName);
    }

    const uniformMatches = combinedSource.matchAll(new RegExp('uniform.*;', 'g'))
    for(const uni of uniformMatches){
      const uniName = uni[0].split(" ")[2].slice(0,-1);
      programInfo.uniforms[uniName] = gl.getUniformLocation(shaderProgram, uniName);
    }
  
    return programInfo;
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
  }
}





