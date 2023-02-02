class rotvec {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    get angle(){
        return Math.hypot(this.x,this.y,this.z)
    }

    get matrix(){
        theta = this.angle
        I = new Float32Array([
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1
        ])

        if(theta < 0.0001)return i;

        let u = new Float32Array([this.x/theta, this.y/theta, this.z/theta])
        let ux = new Float32Array([
            0,      -u[2],  u[1],
            u[2],   0,     -u[0],
            -u[1],  u[0],  0
        ])
    }
}

function mat3_add(a, b){
    return a.map((e,i) => e + b[i])
}

function mat3_mult(a, b){
    let ans = new Float32Array(9)
    for(let i = 0; i < 3; i++){
        for(let j = 0; j < 3; j++){
            for(let k = 0; k < 3; k++){
                ans[i*3+j] += a[i*3+k]*b[k*3+j]
            }
        }
    }
    return ans
}

function print_mat(a){
    for(let i = 0; i < 3; i++){
        let line = ""
        for(let j = 0; j < 3; j++){
            line += a[i*3+j].toString() + " "
        }
        console.log(line)
    }
    console.log();
}

let a = new Float32Array([1,-2,4,4,0,1,3,-3,2])
let b = new Float32Array([1,4,2,-2,2,0,9,-8,1])
print_mat(mat3_mult(a,b))
print_mat(mat3_add(a,b))

