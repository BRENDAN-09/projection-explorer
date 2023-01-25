let a = 10

function meshToIntersect(gltf){
  console.log(gltf);
  for (var i = 0; i < gltf.meshes.length; i++) {
    let mesh = gltf.meshes[i]
    let meshArr = []
    if(mesh.indArr==undefined){
      console.warn(`Skipping ${mesh.name}`)
      continue
    }
    for(let j = 0; j < mesh.indArr.length; j+=1){
      meshArr.push(mesh.posArr[mesh.indArr[j]*3])
      meshArr.push(mesh.posArr[mesh.indArr[j]*3+1])
      meshArr.push(mesh.posArr[mesh.indArr[j]*3+2])
    }
    for(let j = 0; j < mesh.indArr.length; j+=9){
      meshArr[j+0]-=meshArr[j+6]
      meshArr[j+1]-=meshArr[j+7]
      meshArr[j+2]-=meshArr[j+8]
      meshArr[j+3]-=meshArr[j+6]
      meshArr[j+4]-=meshArr[j+7]
      meshArr[j+6]-=meshArr[j+8]
    }
    mesh.meshArr = new Float32Array(meshArr)
  }
}

function meshToDE(gltf){
  for (var i = 0; i < gltf.meshes.length; i++) {
    let mesh = gltf.meshes[i]
    let meshArr = []
    if(mesh.indArr==undefined){
      console.warn(`Skipping ${mesh.name}`)
      continue
    }
    for(let j = 0; j < mesh.indArr.length; j+=1){
      meshArr.push(mesh.posArr[mesh.indArr[j]*3])
      meshArr.push(mesh.posArr[mesh.indArr[j]*3+1])
      meshArr.push(mesh.posArr[mesh.indArr[j]*3+2])
    }
    for(let j = 0; j < mesh.indArr.length; j+=9){
      [
        meshArr[j+0],meshArr[j+1],meshArr[j+2],
        meshArr[j+3],meshArr[j+4],meshArr[j+5],
        meshArr[j+6],meshArr[j+7],meshArr[j+8]
      ] = matrixInverse(...ltransform(
        meshArr[j+0],meshArr[j+1],meshArr[j+2],
        meshArr[j+3],meshArr[j+4],meshArr[j+5],
        meshArr[j+6],meshArr[j+7],meshArr[j+8]
      ))
    }

    mesh.meshArr = new Float32Array(meshArr)
  }
}

function intersectWithGltf(o1,o2,o3,d1,d2,d3,gltf){
  let t = Infinity
  for(let i = 0; i < gltf.meshes.length; i++){
    t = Math.min(t, intersectRayWithMesh(o1,o2,o3,d1,d2,d3,gltf.meshes[i]))
  }
  return t
}

function intersectRayWithMesh(o1,o2,o3, d1,d2,d3, mesh){
  if(mesh.meshArr==undefined)return Infinity
  let t = Infinity

  for(let i = 0; i < mesh.meshArr.length; i+=9){
    let e1 = mesh.meshArr[i+0]
    let e2 = mesh.meshArr[i+1]
    let e3 = mesh.meshArr[i+2]
    let f1 = mesh.meshArr[i+3]
    let f2 = mesh.meshArr[i+4]
    let f3 = mesh.meshArr[i+5]
    let g1 = o1 - mesh.meshArr[i+6]
    let g2 = o2 - mesh.meshArr[i+7]
    let g3 = o3 - mesh.meshArr[i+8]


    let dett = det(e1,e2,e3,f1,f2,f3,g1,g2,g3)
    let detu = det(g1,g2,g3,f1,f2,f3,-d1,-d2,-d3)
    let detv = det(e1,e2,e3,g1,g2,g3,-d1,-d2,-d3)
    let deta = det(e1,e2,e3,f1,f2,f3,-d1,-d2,-d3)


    //if(i < 10) console.log(e1,e2,e3,f1,f2,f3,g1,g2,g3);


    if(deta==0)continue

    let u = detu/deta
    let v = detv/deta
    let ti = dett/deta

    if(0<u && u < 1 && 0 < v && v < 1)console.log(t,u,v);

  //  console.log(detu);



    if(0<u && 1 > u && 0 < v && 1 > v && ti > 0){
      console.log(t,u,v);
      t = Math.min(t,ti)
    }
  }
  return t
}

function det(e1,e2,e3,f1,f2,f3,g1,g2,g3){
  return (e1*f2*g3)+(f1*g2*e3)+(g1*e2*f3)-(g1*f2*e3)-(e1*g2*f3)-(f1*e2*g3)
}

function printMesh(mesh){
  let res = ""
  let meshArr = mesh.meshArr
  let indArr = mesh.indArr
  for(let i = 0; i < meshArr.length; i+=3){
    res+=`v ${meshArr[i]} ${meshArr[i+1]} ${meshArr[i+2]}\n`
  }
  for(let i = 1; i <= indArr.length; i+=3){
    res+=`f ${i} ${i+1} ${i+2}\n`
  }
  console.log(res);
}

function crossProduct(a1,a2,a3,b1,b2,b3){
  return [a2*b3-a3*b2,a3*b1-a1*b3,a1*b2-b1*a2]
}

function matrixInverse(a1,a2,a3, b1,b2,b3, c1,c2,c3){
  let det = (a1*b2*c3)+(b1*c2*a3)+(c1*a2*b3)-(c1*b2*a3)-(a1*c2*b3)-(b1*a2*c3)
  return [
    (b2*c3-c2*b3)/det,-(a2*c3-c2*a3)/det,(a2*b3-b2*a3)/det,
    -(b1*c3-c1*b3)/det,(a1*c3-c1*a3)/det,-(a1*b3-b1*a3)/det,
    (b1*c2-c1*b2)/det,-(a1*c2-c1*a2)/det,(a1*b2-b1*a2)/det]
}

function ltransform(a1,a2,a3, b1,b2,b3, c1,c2,c3){
  let e1 = c1-a1
  let e2 = c2-a2
  let e3 = c3-a3

  let f1 = b1-a1
  let f2 = b2-a2
  let f3 = b3-a3

  let g1 = e2*f3-f2*e3
  let g2 = e1*f3-f1*e3
  let g3 = e1*f2-f2*e1
  let d = Math.hypot(g1,g2,g3)
  return [
    e1,e2,e3,
    f1,f2,f3,
    g1/d,g2/d,g3/d
  ]
}


function distanceEstimator(gltf,q1,q2,q3){
  let t = Infinity
  for(let i = 0; i < gltf.meshes.length; i++){
    t = Math.min(t, distFromMesh(gltf.meshes[i],q1,q2,q3))
  }
  return t
}

function distFromMesh(mesh,q1,q2,q3){
  let t = Infinity
  let meshArr = mesh.meshArr
  for(let j = 0; j < mesh.meshArr.length; j+=9){
    [ a1,a2,a3,
      b1,b2,b3,
      c1,c2,c3
    ] =
    [
      meshArr[j+0],meshArr[j+1],meshArr[j+2],
      meshArr[j+3],meshArr[j+4],meshArr[j+5],
      meshArr[j+6],meshArr[j+7],meshArr[j+8]
    ]
    //A*[u,v,d]
    let u = a1 * q1 + b1 * q2 + c1 * q3
    let v = a2 * q1 + b2 * q2 + c2 * q3
    let d = a3 * q1 + b3 * q2 + c3 * q3

    v = Math.max(0, Math.min(1, v))
    u = Math.max(0, Math.min(1, u))

    let p1 = u * a1 + v * v1 - q1
    let p2 = u * a3 + v * v2 - q2
    let p3 = u * a3 + v * v3 - q3



    let q = b * b1 + v * b2 + v * b3





  }
}
