import { editor, Editor } from "./Editor";
import { StateDomManager } from './DomManager';
import { Connection } from './Connection';

class State {
    private _index: number;
    private _label: string;
    private _editor: Editor;
    private _selected: boolean;
    private _domManager: StateDomManager;
    private _conAsFrom: Map<State, Connection[]>;
    private _conAsTo: Map<State, Connection[]>;
    
    public  get conAsTo() { return this._conAsTo!; }
    public  set conAsTo(v: Map<State, Connection[]>) { this._conAsTo = v; }
    public  get conAsFrom() { return this._conAsFrom!; }
    public  set conAsFrom(v: Map<State, Connection[]>) { this._conAsFrom = v; }
    public  get domManager() { return this._domManager!; }
    public  set domManager(v: StateDomManager) { this._domManager = v; }
    public  get selected() { return this._selected!; }
    public  set selected(v: boolean) { 
        this._selected = v; 
        this.domManager.select(v)
    }
    public  get editor() { return this._editor!; }
    public  set editor(v: Editor) { this._editor = v; }
    public  get label() { return this._label!; }
    public  set label(v: string) { this._label = v; }
    public  get index() { return this._index!; }
    public  set index(v: number) { this._index = v; }

    getDivID(){return `s${this.index}`}

    constructor(x:number, y:number){
        this._conAsFrom = new Map<State, Connection[]>;
        this._conAsTo = new Map<State, Connection[]>;
        this._editor = editor
        this._index = editor.stateList.length
        this._label = `State ${this.index}`
        this._selected = false
        // render
        
        this._domManager = new StateDomManager(this, x, y)
        
        editor.stateList.push(this)
        editor.currentState = this
    }
    connNumberAbout(s:State){
        let n = 0
        if(this.conAsFrom.has(s)){
            n += this.conAsFrom.get(s)!.length
        }
        if(this.conAsTo.has(s)){
            n += this.conAsTo.get(s)!.length
        }
        return n
    }
    removeFrom(from:State){
        this.conAsTo.get(from)?.forEach(c => {
            c.kill()
        })
        this.conAsTo.delete(from)
    }

    removeTo(to:State){
        this.conAsFrom.get(to)?.forEach(c => {
            c.kill()
        })
        this.conAsFrom.delete(to)
    }

    addFrom(from:State, con:Connection){
        const map = this.conAsTo
        if(!map.has(from)){
            map.set(from, [])
        }
        map.get(from)?.push(con)
    }

    addTo(to:State, con:Connection){
        const map = this.conAsFrom
        if(!map.has(to)){
            map.set(to, [])
        }
        map.get(to)?.push(con)
    }
    
    kill(){
        Array.from(this.conAsFrom.keys()).forEach(s => {
            s.removeFrom(this)
        })
        Array.from(this.conAsTo.keys()).forEach(s => {
            s.removeTo(this)
        })
        /**
         * 
         * 
         * 
         * 
         * 
         * 
         * 
         * 
         * 
         * 
         * 
         * 
         * 
         * 
         * 
         * 
         * 
         * 
         * 
         * 
         */
    }
}

export{
    State
}