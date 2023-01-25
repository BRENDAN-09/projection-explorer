/**
 * Creates a vec3 object. All operators are "in place?"
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
function vec3(x,y,z){
    if(x instanceof vec3){
        this.x = this.y = this.z = 0
        this.copy(x)
    }
    this.x = x
    this.y = y
    this.z = z
}

vec3.prototype.sub = function(other){
    this.x = this.x - other.x
    this.y = this.y - other.y
    this.z = this.z - other.z
}

vec3.prototype.add = function(other){
    this.x = this.x + other.x
    this.y = this.y + other.y
    this.z = this.z + other.z
}

vec3.prototype.copy = function(other){
    this.x = other.x
    this.y = other.y
    this.z = other.z
}

vec3.prototype.length = function(){
    return Math.hypot(this.x,this.y,this.z)
}

vec3.prototype.scale = function(a){
    this.x *= a
    this.y *= a
    this.z *= a
}

vec3.prototype.apply = function(matrix){
    xPrime = this.x * matrix[0] + this.y * matrix[4] + this.z * matrix[8]
    yPrime = this.x * matrix[1] + this.y * matrix[5] + this.z * matrix[9]
    zPrime = this.x * matrix[2] + this.y * matrix[6] + this.z * matrix[10]

    this.x = xPrime
    this.y = yPrime
    this.z = zPrime
    return this
}

vec3.prototype.clone = function(){
    return new vec3(this.x,this.y,this.z)
}

vec3.prototype.mix = function(other, v){
  this.x += other.x*v
  this.y += other.y*v
  this.z += other.z*v
}

vec3.prototype.mult = function (other){
  this.x *= other.x
  this.y *= other.y
  this.z *= other.z
}
