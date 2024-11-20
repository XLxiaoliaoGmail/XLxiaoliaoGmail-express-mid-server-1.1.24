import { WsMsgIntBotInfo, WsMsgTypes } from "../../../msgFormat/wsMsgFormat";
import { Dom } from "../Dom";
import { wsMsgSlave as wsMsgSlave } from "../WsMsgSlave";
import { BotManager } from "./BotManager";
import { InvDrawer } from "./InvDrawer";
// import { ViewDrawer } from "./ViewDrawer";

enum LoginBtnState{
    LOGIN,
    WAITING,
    QUIT
}

class BotInfo {
    static domMap = new Map<any, BotInfo>
    static getByDom(dom:any) {
        return BotInfo.domMap.get(dom)
    }

    // private propMap = new Map<PropType, Prop>
    private _detailTab?: HTMLTableElement;
    private _detailDiv: HTMLElement;
    private _showInvBtn?: HTMLButtonElement;
    private _basicInfoRow?: HTMLTableElement;
    private _loginBtn?: HTMLButtonElement;
    private _invDrawer?: InvDrawer;
    private _botManager: BotManager;
    private _usernameDiv: HTMLDivElement;
    private _noteDiv: HTMLDivElement;
    private _smidDiv: HTMLDivElement;
    private _actionDiv: HTMLDivElement;
    private _healthDiv: HTMLDivElement;
    private _invCanvas: HTMLCanvasElement;
    private _showInvKey: string|undefined;
    private _username: string;
    private _note: string;
    private _smid: string;
    private _action: string;
    private _health: number;    
    private _onlined?: boolean;
    private _loginBtnState?: LoginBtnState;
    private _showInvBtnEabled?: boolean;
    private _viewCanvas: HTMLCanvasElement;
    // private _viewDrawer?: ViewDrawer;
    private _showViewKey?: string;
    
    private get showViewKey() { return this._showViewKey!; }
    private set showViewKey(v: string) { this._showViewKey = v; }
    // private get viewDrawer() { return this._viewDrawer!; }
    // private set viewDrawer(v: ViewDrawer) { this._viewDrawer = v; }
    private get viewCanvas() { return this._viewCanvas!; }
    private set viewCanvas(v: HTMLCanvasElement) { this._viewCanvas = v; }
    private get showInvBtnEabled() { return this._showInvBtnEabled!; }
    private set showInvBtnEabled(v: boolean) { 
        this._showInvBtnEabled = v; 
        if(v){
            // this.showInvBtn.disabled = false
            this.showInvBtn.className = 'showinv_btn enabled'
        }else{
            // this.showInvBtn.disabled = true
            this.showInvBtn.className = 'showinv_btn disabled'
        }
    }
    private get loginBtnState() { return this._loginBtnState!; }
    private set loginBtnState(state: LoginBtnState) { 
        if(this._loginBtnState == state)
            return
        this._loginBtnState = state; 
        if(state == LoginBtnState.LOGIN){
            this.loginBtn.innerHTML = '上线'
            this.loginBtn.className = 'login-button login'
            this.loginBtn.disabled = false
        }
        if(state == LoginBtnState.WAITING){
            this.loginBtn.innerHTML = '等待'
            this.loginBtn.className = 'login-button waiting'
            this.loginBtn.disabled = true
        }
        if(state == LoginBtnState.QUIT){
            this.loginBtn.innerHTML = '离线'
            this.loginBtn.className = 'login-button quit'
            this.loginBtn.disabled = false
        }
    }
    public  get isonlined() { return this._onlined!; }
    public  set isonlined(state: boolean) { 
        this._onlined = state; 
        if(state){
            this.showInvBtnEabled = true
            this.loginBtnState = LoginBtnState.QUIT
        }else{
            this.showInvBtnEabled = false
            this.loginBtnState = LoginBtnState.LOGIN
        }
    }    
    private get botManager() { return this._botManager!; }
    private set botManager(v: BotManager) { this._botManager = v; }
    private get showInvKey() { return this._showInvKey!; }
    private set showInvKey(v: string|undefined) { this._showInvKey = v; }    
    private get invCanvas() { return this._invCanvas!; }
    private set invCanvas(v: HTMLCanvasElement) { this._invCanvas = v; }
    private get healthDiv() { return this._healthDiv!; }
    private set healthDiv(v: HTMLDivElement) { this._healthDiv = v; }
    private get actionDiv() { return this._actionDiv!; }
    private set actionDiv(v: HTMLDivElement) { this._actionDiv = v; }
    private get smidDiv() { return this._smidDiv!; }
    private set smidDiv(v: HTMLDivElement) { this._smidDiv = v; }
    private get noteDiv() { return this._noteDiv!; }
    private set noteDiv(v: HTMLDivElement) { this._noteDiv = v; }
    private get usernameDiv() { return this._usernameDiv!; }
    private set usernameDiv(v: HTMLDivElement) { this._usernameDiv = v; }
    public  get health() { return this._health!; }
    public  set health(v: number) { 
        this._health = v; 
        this.healthDiv.innerHTML = String(v)
    }
    public  get action() { return this._action!; }
    public  set action(v: string) { this._action = v; }
    public  get smid() { return this._smid!; }
    public  set smid(v: string) { 
        this._smid = v; 
        this.smidDiv.innerHTML = v
    }
    public  get note() { return this._note!; }
    public  set note(v: string) { 
        this._note = v; 
        this.noteDiv.innerHTML = v
    }
    private get username() { return this._username!; }
    private set username(v: string) { this._username = v; }
    private get invDrawer() { return this._invDrawer!; }
    private set invDrawer(v: InvDrawer) { this._invDrawer = v; }
    private get loginBtn() { return this._loginBtn!; }
    private set loginBtn(v: HTMLButtonElement) { BotInfo.domMap.set(v, this); this._loginBtn = v; }

    private get detailTab() {
        return this._detailTab!
    }
    private set detailTab(v : HTMLTableElement) {
        this._detailTab = v;
        BotInfo.domMap.set(v, this)
    }
    
    private get detailDiv() {
        return this._detailDiv!;
    }
    private set detailDiv(v: HTMLElement) {
        this._detailDiv = v;
        BotInfo.domMap.set(v, this)
    }
    
    private get showInvBtn() {
        return this._showInvBtn!;
    }
    private set showInvBtn(v: HTMLButtonElement) {
        this._showInvBtn = v;
        BotInfo.domMap.set(v, this)
    }

    private get basicInfoRow() {
        return this._basicInfoRow!;
    }
    private set basicInfoRow(v: HTMLTableElement) {
        this._basicInfoRow = v;
        BotInfo.domMap.set(v, this)
    }
    
    constructor(botManager:BotManager, username:string, botinfo:WsMsgIntBotInfo){
        this._botManager = botManager
        this._username = username
        this._note = botinfo.note ?? ''
        this._smid = botinfo.smid ?? 'none'
        this._action = botinfo.action ?? 'idel'
        this._health = botinfo.health ?? -1
        
        const botsInfoBody = this.botManager.getBotsInfoTbody()!
        // 基本信息
        const baseInfoRow = Dom.addElmt(botsInfoBody, 'tr', 'bot-base-info-tr');

        this._usernameDiv   = Dom.addTdDiv(baseInfoRow).div
        this._noteDiv       = Dom.addTdDiv(baseInfoRow).div
        this._smidDiv       = Dom.addTdDiv(baseInfoRow).div
        this._actionDiv     = Dom.addTdDiv(baseInfoRow).div
        this._healthDiv     = Dom.addTdDiv(baseInfoRow).div

        this._usernameDiv .innerHTML = this.username
        this._noteDiv     .innerHTML = this.note
        this._smidDiv     .innerHTML = this.smid
        this._actionDiv   .innerHTML = this.action
        this._healthDiv   .innerHTML = String(this.health)

        const btnsDiv = Dom.addTdDiv(baseInfoRow).div

        this.showInvBtn = Dom.addElmt(btnsDiv, 'button', undefined, undefined, '背包') as HTMLButtonElement
        this.showInvBtn.addEventListener('click', (e) => { BotInfo.getByDom(e.target)!.showDetailBtnclick() })
        this.showInvBtnEabled = false

        this.loginBtn = Dom.addElmt(btnsDiv, 'button') as HTMLButtonElement
        this.loginBtn.addEventListener('click', (e) => { BotInfo.getByDom(e.target)!.loginBtnClick() })
        this.loginBtnState = LoginBtnState.LOGIN
        
        // 创建背包容器
        const invRow = Dom.addElmt(botsInfoBody, 'tr');
        const {td:invTd, div:invDiv} = Dom.addTdDiv(invRow,  'backpack-td');
        invTd.colSpan = 6
        this._detailDiv = invDiv
        invDiv.classList.add('hide')
        invDiv.classList.add('inv-show-div')
        this._invCanvas = Dom.addElmt(invDiv, 'canvas') as HTMLCanvasElement
        this._viewCanvas = Dom.addElmt(invDiv, 'canvas') as HTMLCanvasElement

        this.isonlined = botinfo.onlined
    }

    loginBtnClick() {
        const state = this.loginBtnState
        if(state == LoginBtnState.LOGIN){
            this.loginBtnState = LoginBtnState.WAITING
            wsMsgSlave.send(WsMsgTypes.BOT_LOGIN,  {toMaster:{username: this.username}})
            return
        }
        if(state == LoginBtnState.QUIT){
            this.loginBtnState = LoginBtnState.WAITING
            wsMsgSlave.send(WsMsgTypes.BOT_QUIT,  {toMaster:{username: this.username}})
            return
        }
    }

    showDetailBtnclick() {
        if(!this.showInvBtnEabled){
            this.detailDiv!.className = 'inv-show-div hide'
            return
        }else{
            this.detailDiv!.classList.toggle('show');
            this.detailDiv!.classList.toggle('hide');
        }
        if(!this.showInvKey){
            this.requireInv()
            // this.requireView()
        } else {
            this.showInvKey = undefined
            this.invDrawer.cleanup()
        }
    }

    requireInv(){
        wsMsgSlave.send(WsMsgTypes.BOT_INV_SHOW, {toMaster:{username:this.username}}, (payload) => {
            if(!payload.toSlave!.status) {
                console.log(payload.toSlave!.reason!)
                return
            }
            const key = payload.toSlave!.key!
            this.showInvKey = key
            this.invDrawer = new InvDrawer(this.invCanvas, key)
        })
    }
    // requireView(){
    //     wsMsgSlave.send(WsMsgTypes.BOT_VIEW_SHOW, {toMaster:{username:this.username}}, (payload) => {
    //         if(!payload.toSlave!.status) {
    //             console.log(payload.toSlave!.reason!)
    //             return
    //         }
    //         const key = payload.toSlave!.key!
    //         this.showViewKey = key
    //         this.viewDrawer = new ViewDrawer(this.viewCanvas, key)
    //     })
    // }
}

export {
    BotInfo,
}