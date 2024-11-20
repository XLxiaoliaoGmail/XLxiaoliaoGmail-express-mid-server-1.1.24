// src\Account.js

import { ethers } from 'ethers';
import { WsData } from './WsMsgMaster';
import { BotController } from './BotControler';
import { promises as fs } from 'fs';
import { BotProp, BotPropValType, WsMsgIntBotInfo, WsMsgTypes } from '../msgFormat/wsMsgFormat';

const USERNAME_LENGTH = 15

interface BotDataSave {
    username: string;
    sign: string;
    createTime: string;
    note: string;
}

interface AccDataSave {
    walletAddr: string;
    botdatas: BotData[];
}

interface AccAllDataSave {
    time: string;
    accounts: AccDataSave[];
}

const ACC_DATA_SAVE_URL = './accountsData.json'

function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); 
    const day = now.getDate().toString().padStart(2, '0'); 
    const hours = now.getHours().toString().padStart(2, '0'); 
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

class AccData {
    private static walletAddrToAccDataMap = new Map<string,AccData>

    static async save() { 
        const data = AccData.accAllToJSON()
        // console.log(data)
        const jsonString = JSON.stringify(data, null, 4);
        try {
            await fs.writeFile(ACC_DATA_SAVE_URL, jsonString, 'utf8');
            console.log("Save accounts successfully");
        } catch (error) {
            console.error(`Save ${ACC_DATA_SAVE_URL} failed`, error);
        }
    }
    static async load() {
        let accAllDataSave:AccAllDataSave
        try {
            accAllDataSave = JSON.parse(await fs.readFile(ACC_DATA_SAVE_URL, 'utf8'))
        } catch (err) {
            console.error(`Error when reading ${ACC_DATA_SAVE_URL}`, err);
            return
        }
        AccData.walletAddrToAccDataMap.clear();

        accAllDataSave.accounts.forEach(accDataSave => {
            const accData = AccData.fromJSON(JSON.stringify(accDataSave));
            AccData.walletAddrToAccDataMap.set(accData.walletAddr, accData);
        });
        console.log(`Account data loading finished`);
    }
    
    private _walletAddr: string;
    private _botDataMap: Map<string, BotData>;
    private _wsData: WsData|undefined;
    private _onlined: boolean;
    
    private get onlined() { return this._onlined!; }
    private set onlined(v: boolean) { this._onlined = v; }
    public  get wsData() { return this._wsData!; }
    public  set wsData(v: WsData|undefined) {
            this._wsData = v;
            this.onlined = v ? true : false
        }
    private get botDataMap() { return this._botDataMap!; }
    private set botDataMap(v: Map<string, BotData>) { this._botDataMap = v; }
    private get walletAddr() { return this._walletAddr!; }
    private set walletAddr(v: string) { this._walletAddr = v; }

    toJSON():AccDataSave {
        return {
            walletAddr: this._walletAddr,
            botdatas: Array.from(this.botDataMap.values())
        };
    }

    static fromJSON(json: string): AccData {
        const parsed = JSON.parse(json) as AccDataSave;

        const accData = new AccData(parsed.walletAddr);

        // 反序列化 botdatas 数组，并将其转为 BotData 实例
        if (parsed.botdatas) {
            parsed.botdatas.forEach(botDataJson => {
                const botData = BotData.fromJSON(JSON.stringify(botDataJson), accData);
                accData.botDataMap.set(botData.username, botData);
            });
        }

        return accData;
    }

    static accAllToJSON():AccAllDataSave{
        return {
            time: getFormattedDate(), 
            accounts: Array.from(AccData.walletAddrToAccDataMap.values()).map(accData => accData.toJSON())
        }
    }

    constructor(walletAddr: string) {
        this._onlined = false
        this._walletAddr = walletAddr!;
        this._botDataMap = new Map<string, BotData>;
        AccData.walletAddrToAccDataMap.set(this._walletAddr, this)
        this.onlined = false
    }

    static getByWalletAddr(addr: string) {
        return AccData.walletAddrToAccDataMap.get(addr)
    }

    getBotData(username: string) {
        return this.botDataMap.get(username)
    }

    verify(message: string, signature: string) {
        const recoveredAddress = ethers.verifyMessage(message, signature);
        return recoveredAddress.toLowerCase() === this.walletAddr.toLowerCase();
    }

    createBot(createTime: string, sign: string, note: string) {
        const botData = new BotData(this, createTime, sign, note)
        this.botDataMap.set(botData.username, botData)
        return botData
    }

    getAllWsMsgIntBotInfo(){
        const botinfos = new Array<{username:string, botinfo:WsMsgIntBotInfo}>
        this.botDataMap.forEach((botdata, username) => {
            botinfos.push({username, botinfo:botdata.getWsMsgIntBotInfo()})
        })
        return botinfos
    }
} 

class BotData {

    private _username: string;
    private _owner: AccData;
    private _sign: string;
    private _createTime: string;
    private _botControler?: BotController;
    private _isonlined: boolean;
    private _note: string;
    private _invShown: boolean;
    
    public  get invShown() { return this._invShown!; }
    public  set invShown(v: boolean) { this._invShown = v; }
    public  get note() { return this._note!; }
    private set note(v: string) { 
        this._note = v;
        this.sendUpdateToWeb(BotProp.NOTE, v)
    }
    public  get isonlined() { return this._isonlined!; }
    private set isonlined(v: boolean) { 
        this._isonlined = v; 
        this.sendUpdateToWeb(BotProp.ISONLINED, v)
    }
    public  get botControler() { return this._botControler!; }
    private set botControler(v: BotController) { this._botControler = v; }
    private get createTime() { return this._createTime!; }
    private set createTime(v: string) { this._createTime = v; }
    private get sign() { return this._sign!; }
    private set sign(v: string) { this._sign = v; }
    private get owner() { return this._owner!; }
    private set owner(v: AccData) { this._owner = v; }
    public  get username() { return this._username!; }
    private set username(v: string) { this._username = v; }

    getWsMsgIntBotInfo():WsMsgIntBotInfo {
        return {
            onlined:this.isonlined,
            note:this.note,
        }
    }

    toJSON():BotDataSave {
        return {
            username:this.username,
            sign:this.sign,
            createTime:this.createTime,
            note:this.note
        };
    }

    static fromJSON(json: string, owner:AccData): BotData {
        const parsed = JSON.parse(json) as BotDataSave;

        // 创建 BotData 实例，并设置其他未涉及的属性为 undefined
        const botData = new BotData(owner, parsed.createTime, parsed.sign, parsed.note)

        return botData;
    }

    constructor(owner: AccData, createTime:string, sign: string, note: string) {
        this._owner = owner;
        this._sign = sign;
        this._username = sign.slice(0, USERNAME_LENGTH)
        this._isonlined = false
        this._createTime = createTime
        this._note = note
        this._invShown = false
    }

    sendUpdateToWeb<T extends BotProp>(prop:T, value:BotPropValType[T]) {
        this.owner.wsData?.send(WsMsgTypes.BOT_UPDATE, {toSlave:{
            username:this.username,
            prop,
            value
        }})
    }

    async login() {
        if(this.isonlined){
            return false
        }
        return new Promise<boolean>((resolve) => {
            this.botControler = new BotController(this, state => {
                if(state){
                    this.isonlined = true
                }
                resolve(state)
            })
        })
    }

    quit() {
        if(!this.isonlined){
            return false
        }
        this.botControler!.quit()
        this.isonlined = false
        return true
    }
}

export {
    AccData,
    BotData
}