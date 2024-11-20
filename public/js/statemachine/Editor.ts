import { Dom } from '../Dom';
import { State } from './State';
import { Connection } from './Connection';
import { StateDomManager } from './DomManager';

const SVG_DEF_ARROW_ID = 'a'
interface ToBeClear {
    keyDownListener?: (this: Document, ev: KeyboardEvent) => any,
}
let editor: Editor
class Editor {

    private _container: HTMLElement;
    private _stateList: State[];
    private _currentState: State|undefined;
    private _toBeClear: ToBeClear;
    private _detailDiv?: HTMLDivElement;
    private _svgCanvas: SVGSVGElement;
    private _connList: Connection[];

    public  get connList() { return this._connList!; }
    public  set connList(v: Connection[]) { this._connList = v; }
    public  get svgCanvas() { return this._svgCanvas!; }
    public  set svgCanvas(v: SVGSVGElement) { this._svgCanvas = v; }
    private get detailDiv() { return this._detailDiv!; }
    private set detailDiv(v: HTMLDivElement) { this._detailDiv = v; }
    private get toBeClear() { return this._toBeClear!; }
    private set toBeClear(v: ToBeClear) { this._toBeClear = v; }
    public  get currentState() { return this._currentState!; }
    public  set currentState(v: State|undefined) { 
        if(this._currentState == v)
            return
        if(this._currentState){
            this._currentState.selected = false
            this._currentState.domManager.div.style.zIndex = '1'
        }
        if(v){
            v.selected = true
            v.domManager.div.style.zIndex = '2'
        }
        this._currentState = v; 
    }
    public  get stateList() { return this._stateList!; }
    private set stateList(v: State[]) { this._stateList = v; }
    public  get container() { return this._container!; }
    private set container(v: HTMLElement) { this._container = v; }

    constructor(container: HTMLElement) {
        this._toBeClear = {}
        this._connList = []
        this._stateList = []
        this._container = Dom.addElmt(container, 'div', 'sm-div')
        this._svgCanvas = this.createSVGContainer()

        this.setupUserInputListener()
    }
    setDraggalble(domManager:StateDomManager){
        const div = domManager.div
        div.onmousedown = e => {
            Dom.eventStop(e)
            const x0 = e.clientX
            const y0 = e.clientY
            const rect = div.getBoundingClientRect()
            const left0 = rect.left
            const top0 = rect.top
            div.style.cursor = 'grabbing'
            document.body.style.cursor = 'grabbing'
            if(!e.ctrlKey)
                this.currentState = domManager.state
            const onmousemove = (e:MouseEvent) => {
                Dom.eventStop(e)
                const dx = e.clientX - x0
                const dy = e.clientY - y0
                div.style.left = `${left0 + dx}px`
                div.style.top = `${top0 + dy}px`
                domManager.paintAllCons()

            }
            const onmouseup = (e:MouseEvent) => {
                Dom.eventStop(e)
                div.onmousemove = null
                div.onmouseup = null
                document.removeEventListener('mousemove', onmousemove)
                document.removeEventListener('mouseup', onmouseup)
                div.style.cursor = ''
                document.body.style.cursor = ''
            }
            div.onmousemove = onmousemove
            div.onmouseup = onmouseup
            document.addEventListener('mousemove', onmousemove)
            document.addEventListener('mouseup', onmouseup)
        }
    }

    createSVGContainer() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('id', 'lineCanvas');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        document.body.appendChild(svg);

        // arrow marker 
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        marker.setAttribute('id', SVG_DEF_ARROW_ID);
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '10');
        marker.setAttribute('refX', '5');
        marker.setAttribute('refY', '5');
        marker.setAttribute('orient', 'auto');
        marker.setAttribute('markerUnits', 'strokeWidth');

        path.setAttribute('d', 'M0,0 L10,5 L0,10 Z');
        path.setAttribute('fill', 'black');
    
        marker.appendChild(path);
        defs.appendChild(marker);
        svg.appendChild(defs);

        return svg;
    }
    setUpCanvasGrab(){
        this.container.addEventListener('mousedown', e => {
            Dom.eventStop(e)
            if(e.buttons != 1)
                return
            this.container.style.cursor = 'grabbing'
            const originX = e.clientX
            const originY = e.clientY
            this.stateList.forEach(s => {
                s.domManager.startMove()
            })
            const mouseMoveListener = (e:MouseEvent) => {
                const dx = e.clientX - originX
                const dy = e.clientY - originY
                this.stateList.forEach(s => [
                    s.domManager.move(dx, dy)
                ])
            }
            const mouseUpOrLeaveListener = () => {
                this.container.style.cursor = ''
                this.container.removeEventListener('mousemove', mouseMoveListener)
                this.container.removeEventListener('mouseup', mouseUpOrLeaveListener)
            }
            
            this.container.addEventListener('mousemove', mouseMoveListener)
            this.container.addEventListener('mouseup', mouseUpOrLeaveListener)
            this.container.addEventListener('mouseleave', mouseUpOrLeaveListener)
        });
    }
    setupUserInputListener(){

        // create state
        this.container.addEventListener('contextmenu', e => {
            Dom.eventStop(e)
            this.createState(e.clientX, e.clientY);
        });
        this.setUpCanvasGrab()
        this.toBeClear.keyDownListener = e => {
            if(!(e.key === 'Escape' || e.key === 'Delete'))
                return
            if(!this.currentState)
                return
            this.currentState.kill()
            this.currentState = undefined
        }
        document.addEventListener('keydown', this.toBeClear.keyDownListener);

    }

    connect(from:State, to:State) {
        // state prop setting has conducted in this construction
        this.connList.push(new Connection(from, to))
    }

    static init() {
        const container = Dom.container!.lastElementChild as HTMLElement
        editor = new Editor(container)
    }

    static clear() {
        document.removeEventListener('keydown', editor.toBeClear.keyDownListener!)
    }

    private createState(x: number, y: number) {
        new State(x,y)
    }
}

export {
    Editor,
    editor,
    SVG_DEF_ARROW_ID
}