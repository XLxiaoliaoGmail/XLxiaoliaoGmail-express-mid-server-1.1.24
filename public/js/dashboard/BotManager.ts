import { BotProp, WsMsgTypes, WsSlaveCallback } from "../../../msgFormat/wsMsgFormat";
import { Dom } from "../Dom";
import { web3Account } from "../Web3Account";
import { wsMsgSlave } from "../WsMsgSlave";
import { BotInfo } from "./BotInfo";

let botManager: BotManager
class BotManager {

    private botsInfoTbody?: HTMLTableSectionElement
    private newbotContainer?: HTMLElement
    private timeInput?: HTMLInputElement
    private signatureInput?: HTMLInputElement
    private createButton?: HTMLButtonElement
    private noteInput?: HTMLInputElement
    private botPropUpdateListener?: WsSlaveCallback<WsMsgTypes.BOT_UPDATE>

    private _botInfoMap: Map<string,BotInfo>;
    
    private get botInfoMap() { return this._botInfoMap!; }
    private set botInfoMap(v: Map<string,BotInfo>) { this._botInfoMap = v; }

    static init(){
        botManager = new BotManager() 
        
        botManager.botPropUpdateListener = (payload) => {
            const info = payload.toSlave!
            const botinfo = botManager.botInfoMap.get(info.username)
            if(!botinfo)
                return
            switch (info.prop) {
                case BotProp.ISONLINED:
                    botinfo.isonlined = info.value as boolean
                    break;
                case BotProp.NOTE:
                    botinfo.note = info.value as string
                    break;
                case BotProp.HEALTH:
                    botinfo.health = info.value as number
                    break;
            
                default:
                    break;
            }
        }
        wsMsgSlave.on(WsMsgTypes.BOT_UPDATE, botManager.botPropUpdateListener)
    }

    constructor() {
        this._botInfoMap = new Map<string,BotInfo>;
        this.showBasicHTML()
        wsMsgSlave.send(WsMsgTypes.ACC_BOTS_INFO, {toMaster:{addr:web3Account.walletAddr}}, payload => {
            if(!payload.toSlave?.status){
                console.log(payload.toSlave?.reason)
                return
            }
            const bots = payload.toSlave!.bots!
            bots.forEach(bot => {
                this.botInfoMap.set(bot.username, new BotInfo(botManager, bot.username, bot.botinfo))
            })
        })     
    }

    async queryBotInfo(username:string){
        wsMsgSlave.send(WsMsgTypes.BOT_INFO, {toMaster: {username}}, (payload) => {
            if(!payload.toSlave?.status){
                console.log(payload.toSlave?.reason)
                return
            }
            this.botInfoMap.set(username, new BotInfo(botManager, username, payload.toSlave!.botinfo!))
        })
    }
    
    async createBot() {
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
         */
        wsMsgSlave.send(WsMsgTypes.BOT_CREATE, {toMaster: {
            time: this.timeInput!.value,
            sign: this.signatureInput!.value,
            note: this.noteInput!.value
        }}, (payload) => {
            if(payload.toSlave!.status){
                console.log(`Create bot successfully`)
                if(this.newbotContainer!.classList.contains('show'))
                    this.toggleNewBotDiv()
                this.queryBotInfo(payload.toSlave!.username!)
            }else {
                console.log(payload.toSlave!.reason)
            }
        })
    }

    getBotsInfoTbody() {
        return this.botsInfoTbody
    }

    toggleNewBotDiv() {
        this.newbotContainer!.classList.toggle('show');
        this.newbotContainer!.classList.toggle('hide');
        this.timeInput!.value = Dom.getCurrentTimeFormatted()
    }

    async newBotSign() {
        try {
            const time = this.timeInput!.value
            const sign = await web3Account.sign(time)
            this.signatureInput!.value = sign
            this.createButton!.disabled = false
        } catch (error) {
            console.log(`sign error`, error)
        }
    }
    
    showBasicHTML() {
        const show = Dom.container!.lastElementChild as HTMLElement

        show.innerHTML = ''
        
        // 创建表格元素
        const botsTable = Dom.addElmt(show, 'table', 'infoTable');
        
        // 创建表头
        const thead = Dom.addElmt(botsTable, 'thead');
        const headerRow = Dom.addElmt(thead, 'tr');
        const headers = ['ID', '备注', '状态机', '动作', '生命', '更多'];
    
        headers.forEach(header => {
            Dom.addElmt(Dom.addElmt(headerRow, 'th', undefined, undefined), 'div', undefined, undefined, header)
        });
    
        // 创建表体
        this.botsInfoTbody = Dom.addElmt(botsTable, 'tbody') as HTMLTableSectionElement;
        
        const newBotBtn = Dom.addElmt(Dom.addElmt(show, 'div', 'new-bot-btn-div'), 'button', 'new-bot-btn', undefined, '新建机器人')
        newBotBtn.addEventListener('click', () => { botManager.toggleNewBotDiv() })
            
        // 创建新建机器人容器
        this.newbotContainer = Dom.addElmt(show, 'div', 'hideshow-container');
        this.newbotContainer.classList.add('hide');

        const modal = Dom.addElmt(this.newbotContainer, 'div', 'modal', 'modal', '');
        const modalContent = Dom.addElmt(modal, 'div', 'modal-content', '', '');

        const noteLabel = Dom.addElmt(modalContent, 'label', '', 'robotNoteLabel', '备注:');
        this.noteInput = Dom.addElmt(modalContent, 'input', '', 'robotNote') as HTMLInputElement;

        const timeLabel = Dom.addElmt(modalContent, 'label', '', 'creationTimeLabel', '创建时间:');
        this.timeInput = Dom.addElmt(modalContent, 'input', '', 'creationTime', '') as HTMLInputElement;
        this.timeInput.readOnly = true;

        const signatureLabel = Dom.addElmt(modalContent, 'label', '', 'signatureLabel', '签名:');
        this.signatureInput = Dom.addElmt(modalContent, 'input', '', 'signature', '') as HTMLInputElement;
        this.signatureInput.readOnly = true;

        const createBotSignBtn = Dom.addElmt(modalContent, 'button', '', 'signButton', '签名');
        createBotSignBtn.addEventListener('click', () => { botManager.newBotSign() })

        this.createButton = Dom.addElmt(modalContent, 'button', '', 'this.createButton', '创建') as HTMLButtonElement;
        this.createButton.disabled = true;
        this.createButton.addEventListener('click', () => { botManager.createBot() })
    }
}

export {
    BotManager,
    botManager
}