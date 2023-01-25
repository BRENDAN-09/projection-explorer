let mat4 = {
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
}
