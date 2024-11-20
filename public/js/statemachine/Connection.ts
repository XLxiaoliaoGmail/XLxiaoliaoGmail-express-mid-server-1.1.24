import { Vec2 } from "../Vec2";
import { editor, SVG_DEF_ARROW_ID } from "./Editor";
import { State } from "./State";

class Connection {
    private _line: SVGLineElement;
    private _from: State;
    private _to: State;
    private _arrowLine: SVGLineElement;
    private _connIndexBetweenFromTo: number;
    
    public  get connIndexBetweenFromTo() { return this._connIndexBetweenFromTo!; }
    public  set connIndexBetweenFromTo(v: number) { this._connIndexBetweenFromTo = v; }
    public  get arrowLine() { return this._arrowLine!; }
    public  set arrowLine(v: SVGLineElement) { this._arrowLine = v; }
    public  get to() { return this._to!; }
    public  set to(v: State) { this._to = v; }
    public  get from() { return this._from!; }
    public  set from(v: State) { this._from = v; }
    public  get line() { return this._line!; }
    public  set line(v: SVGLineElement) { this._line = v; }

    constructor(from:State, to:State){
        this._from = from
        this._to = to
        this._connIndexBetweenFromTo = from.connNumberAbout(to)

        this._line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this._line.setAttribute('stroke', 'black');
        this._line.setAttribute('stroke-width', '2');
        editor.svgCanvas.appendChild(this._line);
        
        this._arrowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this._arrowLine.setAttribute('stroke', 'black');
        this._arrowLine.setAttribute('stroke-width', '2');
        this._arrowLine.setAttribute('marker-end', `url(#${SVG_DEF_ARROW_ID})`);
        editor.svgCanvas.appendChild(this._arrowLine);

        from.addTo(to, this)
        to.addFrom(from, this)
        this.paint()
    }
    kill(){
        
    }
    paint(){
        const offset = new Vec2(0, -50).mul(this.connIndexBetweenFromTo)
        const from = this.from.domManager.getEdgePos(0.5, 0.5).add(offset)
        const to = this.to.domManager.getEdgePos(0.5, 0.5).add(offset)
        
        this.line.setAttribute('x1', `${from.x}`);
        this.line.setAttribute('y1', `${from.y}`);
        this.arrowLine.setAttribute('x1', `${from.x}`);
        this.arrowLine.setAttribute('y1', `${from.y}`);
        
        this.line.setAttribute('x2', `${to.x}`);
        this.line.setAttribute('y2', `${to.y}`);
        this.arrowLine.setAttribute('x2', `${(to.x +from.x)/2}`);
        this.arrowLine.setAttribute('y2', `${(to.y +from.y)/2}`);

    }
}

export {
    Connection,
}