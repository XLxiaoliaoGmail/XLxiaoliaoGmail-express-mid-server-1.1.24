import { Connection } from "jsplumb";
import { Dom } from "../Dom";
import { editor } from "./Editor";
import { State } from "./State";
import { Vec2 } from "../Vec2";

const STATE_DIV_DEFAULT_WIDTH = 260
class StateDomManager {
    private _resize: HTMLDivElement;
    private _isresizing: boolean;
    private _state: State;
    private _position: {x:number, y:number};
    private _div: HTMLDivElement;
    private _startMoveX: number;
    private _startMoveY: number;

    public  get rect() { return this.div.getBoundingClientRect(); }
    public  get startMoveY() { return this._startMoveY!; }
    public  set startMoveY(v: number) { this._startMoveY = v; }
    public  get startMoveX() { return this._startMoveX!; }
    public  set startMoveX(v: number) { this._startMoveX = v; }
    public  get div() { return this._div!; }
    public  set div(v: HTMLDivElement) { this._div = v; }
    private get position() { return this._position!; }
    private set position(v: {x:number, y:number}) { this._position = v; }
    public  get state() { return this._state!; }
    private set state(v: State) { this._state = v; }
    private get isresizing() { return this._isresizing!; }
    private set isresizing(v: boolean) { this._isresizing = v; }
    private get resize() { return this._resize!; }
    private set resize(v: HTMLDivElement) { this._resize = v; }

    constructor(state:State, x:number, y:number) {
        this._state = state
        this._isresizing = false
        this._position = {x, y}
        this._div = Dom.addElmt(editor.container, 'div', 'state-div') as HTMLDivElement
        this.div.style.left = `${this.position.x}px`;
        this.div.style.top = `${this.position.y}px`;
        this.div.style.width = `${STATE_DIV_DEFAULT_WIDTH}px`;
        this._startMoveX = 0
        this._startMoveY = 0
        this._resize = Dom.addElmt(this.div, 'div', 'resize-div') as HTMLDivElement


        this.clickListener()
        this.setResizer()
        this.setPropInput()
        this.setDraggalble()
    }
    setDraggalble(){
        editor.setDraggalble(this)
    }
    paintAllCons(){
        this.state.conAsFrom.forEach(cons => {
            cons.forEach(con => {
                con.paint()
            })
        })
        this.state.conAsTo.forEach(cons => {
            cons.forEach(con => {
                con.paint()
            })
        })
    }
    clickListener(){
        this.div.onclick = e => {
            Dom.eventStop(e)
            if(e.ctrlKey){
                if(!editor.currentState) return
                editor.connect(editor.currentState, this.state)
            }
            editor.currentState = this.state
        }
    }
    getEdgePos(x:number, y:number){
        if(x > 1) x=1
        if(x < 0) x=0
        if(y > 1) y=1
        if(y < 0) y=0
        return new Vec2(
            this.rect.left + x * this.rect.width,
            this.rect.top + y * this.rect.height
        )
    }
    scale(cursorX:number, cursorY:number, scale:number){
        this.div.style.transformOrigin = `${cursorX}px ${cursorY}px`;  // 设置缩放焦点为鼠标位置
        this.div.style.transform = `scale(${scale})`;  // 缩放整个画布
    }

    startMove(){
        this.startMoveX = this.div.offsetLeft
        this.startMoveY = this.div.offsetTop
    }

    move(dx:number, dy:number){
        this.setPos(this.startMoveX+dx, this.startMoveY+dy)
        this.paintAllCons()
    }

    setPos(x:number, y:number){
        this.div.style.left = `${x}px`
        this.div.style.top = `${y}px`
    }

    remove(){
        this.div.remove()
    }
    select(status:boolean){
        this.div.className = `state-div ${status?'selected':''}`
    }

    setPropInput(){
        const propDiv = Dom.addElmt(this.div, 'div', 'prop-div');
        
        const propDivLeft = Dom.addElmt(propDiv, 'div');
        [
            /* 0 */{note:'状态名',    type:'input' },
            /* 1 */{note:'超时',    type:'input' },
            /* 2 */{note:'主体',    type:'select'},
            /* 3 */{note:'行为',    type:'select'},
            /* 4 */{note:'保存到',    type:'select'},
            /* 5 */{note:'参数0',   type:'select'},
            /* 6 */{note:'参数1',   type:'select'},
            /* 7 */{note:'参数2',   type:'select'},
            /* 8 */{note:'参数3',   type:'select'},
        ].forEach((v, i) => {
            const inputGroup = Dom.addElmt(propDivLeft, 'div', 'input-group')
            const label = Dom.addElmt(inputGroup, 'div', 'prop-lable', undefined, v.note)
            const input = Dom.addElmt(Dom.addElmt(inputGroup, 'div', 'input-outer-div'), v.type, 'prop-input')
            if(i == 0){
                (input as HTMLInputElement).value = this.state.label
            }else if([5,6,7,8].includes(i)){
                inputGroup.style.display = 'none'
            }
        })
    }

    setResizer(){
        
        this.resize.addEventListener('mousedown', (e) => {
            Dom.eventStop(e)
            this.isresizing = true;

            const startX = e.clientX;
            const startWidth  = Number(this.div.style.width.split('px')[0])

            const onMouseMove = (e: MouseEvent) => {
                Dom.eventStop(e)
                if (!this.isresizing) return;
                const dx = e.clientX - startX;
                this.div.style.width = `${startWidth + dx}px`;
                this.paintAllCons()
            };

            const onMouseUp = () => {
                Dom.eventStop(e)
                this.isresizing = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }
}

export {
    StateDomManager   
}