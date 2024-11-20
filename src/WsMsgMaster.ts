// src/ServerSocketManager.ts

import WebSocket from 'ws';
import { WsMsgTypes, createWsMsg, WsMasterCallback, WsPayloadTypes } from '../msgFormat/wsMsgFormat';
import { AccData } from './Account';
import { Server } from 'http';
import { invServer } from './InvServer/InvServer';
import { DEBUG } from '../debug';

let wsMsgMaster: WsMsgMaster;

class WsMsgMaster {
    wss: WebSocket.Server;
    callbacks: Partial<Record<WsMsgTypes, WsMasterCallback<any>>> = {};

    static init(server: Server){
        wsMsgMaster = new WsMsgMaster(server);
        wsMsgMaster.listenerInit();
    }

    constructor(server: Server) {
        this.wss = new WebSocket.Server({ server });
        this.callbacks = {};

        this.wss.on('connection', (ws: WebSocket, req: any) => {
            const wsdata = new WsData(ws, req.socket.remoteAddress);
            wsdata.log(`Connected`)
            ws.on('message', (message: string) => {
                const { type, payload } = JSON.parse(message);
                this.handleMessage(ws, type, payload);
            });

            ws.on('close', () => {
                wsdata.log("Closed");
            });
        });

        this.wss.on('error', (error: Error) => {
            console.error("WebSocket error:", error);
        });
    }

    listenerInit(){

        this.on(WsMsgTypes.LOGIN_CHALLENGE, (wsData, payload) => {
            // new SocketData has been created when connected so it must be SocketData
            const challenge = `logintime:${Date.now()}`;
            wsData.walletAddr = payload.toMaster!.addr
            wsData.loginChallenge = challenge
            wsData.send(WsMsgTypes.LOGIN_CHALLENGE, { toSlave:{challenge} });
            wsData.log(`Connected, sent challenge: ${challenge}`);
            let accData = AccData.getByWalletAddr(payload.toMaster!.addr)
            if(!accData){
                // sd without walletAddr impossiblly come here
                accData = new AccData(wsData.walletAddr)
            }
            wsData.accData = accData
            accData.wsData = wsData
        });

        this.on(WsMsgTypes.LOGIN_SIGNATURE, (wsData, payload) => {
            const verified = wsData.accData!.verify(wsData.loginChallenge!, payload.toMaster!.sign)
            wsData.send( WsMsgTypes.LOGIN_SIGNATURE, { toSlave:{status:verified} });
            wsData.logined = verified
            if(verified)
                wsData.log(`Verify and login successfully.`);
            else
                wsData.log(`Verify failed.`);
        });

        this.on(WsMsgTypes.BOT_CREATE, (wsData, payload) => {
            const {time, sign, note} = payload.toMaster!
            if(!time || !sign)
                return
            if (wsData.accData!.verify(time, sign)) {
                const botData = wsData.accData!.createBot(time, sign, note)
                wsData.send(WsMsgTypes.BOT_CREATE, { toSlave:{status: true, username:botData.username} });
                wsData.log(`Create bot successfully.`);
            } else {
                wsData.send(WsMsgTypes.BOT_CREATE, { toSlave:{status: false} });
                wsData.log(`Create bot failed.`);
            }
        });

        this.on(WsMsgTypes.BOT_LOGIN, async (wsData, payload) => {
            const botData = wsData.accData!.getBotData(payload.toMaster!.username)
            if(!botData){
                wsData.log(`Try to login bot not belong to its account`)
                return
            }
            if(! await botData.login()){
                wsData.log(`Try login failed`)
                return
            }
        });

        this.on(WsMsgTypes.BOT_QUIT, (wsData, payload) => {
            const bot = wsData.accData!.getBotData(payload.toMaster!.username)
            if(!bot){
                wsData.log(`Try to quit bot not belong to its account`)
                return
            }
            if(!bot.quit()) {
                wsData.log(`Try quit failed`)
                return
            }
        });

        this.on(WsMsgTypes.BOT_INFO, (wsData, payload) => {
            const botData = wsData.accData!.getBotData(payload.toMaster!.username)
            if(!botData){
                const reason = `Try get info of bot not belong to its account`
                wsData.log(reason)
                wsData.send(WsMsgTypes.BOT_INFO, { toSlave:{status: false, reason} })
                return
            }
            wsData.send(WsMsgTypes.BOT_INFO, { toSlave:{status: false, botinfo: botData.getWsMsgIntBotInfo()} })
        });

        this.on(WsMsgTypes.BOT_INV_SHOW, (wsData, payload) => {
            const botData = wsData.accData!.getBotData(payload.toMaster!.username)
            if(!botData){
                const reason = `Try get inv show of bot not belong to its account`
                wsData.log(reason)
                wsData.send(WsMsgTypes.BOT_INV_SHOW, { toSlave:{status: false} })
                return
            }
            if(!botData.isonlined){
                const reason = `Try get inv show without login`
                wsData.log(reason)
                wsData.send(WsMsgTypes.BOT_INV_SHOW, { toSlave:{status:false, reason} })
                return
            }
            if(botData.invShown){
                const reason = `Try get double inv shown`
                wsData.log(reason)
                wsData.send(WsMsgTypes.BOT_INV_SHOW, { toSlave:{status:false, reason} })
                return
            }
            const key = invServer.registerBot(botData)
            wsData.send(WsMsgTypes.BOT_INV_SHOW, { toSlave:{status:true, key: key} })
        });

        this.on(WsMsgTypes.ACC_BOTS_INFO, (wsData, payload) => {
            const acc = AccData.getByWalletAddr(payload.toMaster!.addr)
            if(!acc){
                return
            }
            wsData.send(WsMsgTypes.ACC_BOTS_INFO, {toSlave:{status:true, bots:acc.getAllWsMsgIntBotInfo()}})
        });
    }

    broadcast(type: number, payload: any){
        /**
         * 
         */
    }

    on<T extends WsMsgTypes>(type: T, callback: WsMasterCallback<T>) {
        this.callbacks[type] = callback;
    }

    handleMessage<T extends WsMsgTypes>(ws: WebSocket, type: T, payload: WsPayloadTypes[T]){
        const wsData = WsData.getByWs(ws) as WsData;
        wsData.log(`Recieve <- [${WsMsgTypes[type]}] {${JSON.stringify(payload.toMaster)}}`)
        if(!payload.toMaster){
            wsData.log(`Try to send msg without [toMaster]`)
            return
        }

        // ws without wallet addr can noly send LOGIN_CHALLENGE
        if(!wsData.walletAddr && (type !== WsMsgTypes.LOGIN_CHALLENGE)) {
            wsData.log(`Try to send msg type ${type} without wallte addr`)
            return
        } 

        if(!DEBUG)
            // ws without login can noly send LOGIN_SIGNATURE
            if(!wsData.logined && ![WsMsgTypes.LOGIN_SIGNATURE, WsMsgTypes.LOGIN_CHALLENGE].includes(type)) {
                wsData.log(`Try to send msg type ${type} without login`)
                return
            }
        
        /**
         * 
         * Need more strict check
         * 
         */

        const callback = this.callbacks[type];
        if (callback) {
            callback(wsData, payload);
        }
    }
}


export class WsData {
    static dataMap = new Map<WebSocket, WsData>();
    static list = new Array<WsData>
    static getByWs(ws: WebSocket): WsData | undefined {
        return WsData.dataMap.get(ws);
    }

    private _ws: WebSocket;
    private _remoteAddr: string;
    private _walletAddr?: string;
    private _loginChallenge?: string;
    private _logined: boolean;
    private _accData?: AccData;
    
    public  get accData() { return this._accData!; }
    public  set accData(v: AccData) { this._accData = v; }
    public  get logined() { return this._logined!; }
    public  set logined(v: boolean) { this._logined = v; }
    public  get loginChallenge() { return this._loginChallenge!; }
    public  set loginChallenge(v: string) { this._loginChallenge = v; }
    public  get walletAddr() { return this._walletAddr!; }
    public  set walletAddr(v: string) { this._walletAddr = v; this.log(`Wallet address set: ${v}`); }
    private get remoteAddr() { return this._remoteAddr!; }
    private set remoteAddr(v: string) { this._remoteAddr = v; }
    private get ws() { return this._ws!; }
    private set ws(v: WebSocket) { this._ws = v; }
    

    constructor(ws: WebSocket, remoteAddr: string) {
        this._ws = ws;
        this._remoteAddr = remoteAddr;
        this._logined = false;

        WsData.dataMap.set(ws, this);
        WsData.list.push(this);
    }

    send<T extends WsMsgTypes>(type: T, payload: WsPayloadTypes[T]) {
        this.log(`Send    -> [${WsMsgTypes[type]}] {${JSON.stringify(payload.toSlave)}}`)
        this.ws.send(createWsMsg(type, payload));
    }

    log(msg: string){
        console.log(`[Socket][${this.remoteAddr}]: ${msg}`);
    }
}

export {
    wsMsgMaster as wss,
    WsMsgMaster
};
