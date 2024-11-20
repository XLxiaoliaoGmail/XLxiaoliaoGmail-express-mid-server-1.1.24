class Vec2{
    private _x: number;
    private _y: number;
    private _len?: number;
    
    public  get len() { 
        if(!this._len){
            this._len = Math.sqrt(this._x * this._x + this._y * this._y);
        }
        return this._len; 
    }
    public  get y() { return this._y!; }
    public  get x() { return this._x!; }

    constructor(x:number, y:number){
        this._x = x
        this._y = y
    }
    add(v:Vec2){
        return new Vec2(
            this.x + v.x,
            this.y + v.y
        )
    }
    sub(v:Vec2){
        return new Vec2(
            this.x - v.x,
            this.y - v.y
        )
    }
    product(v:Vec2){
        return this.x * v.x + this.y * v.y
    }
    mul(v:number){
        return new Vec2(
            this.x * v,
            this.y * v
        )
    }
    unit(){
        if(this.len == 0)
            throw(`Cannot unit zero vec`)
        return new Vec2(
            this.x / this.len,
            this.y / this.len
        )
    }
    rotate90(){
        return new Vec2(
            this.y,
            - this.x
        )
    }
    rotate(rad: number) {
        const sin = Math.sin(rad)
        const cos = Math.cos(rad)
        return new Vec2(
            this.x * cos    + this.y * sin, 
            this.x * (-sin) + this.y * cos
        );
    }
}
export {
    Vec2
}