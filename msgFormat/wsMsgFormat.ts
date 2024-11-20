// src/msgFormat/wsMsgFormat.ts

import { WsData } from "../src/WsMsgMaster";


const MAIN_SOCKET_PORT = 8888

enum WsMsgTypes {
    LOGIN_CHALLENGE = 0,
    LOGIN_SIGNATURE,
    BOT_CREATE,
    DEBUG_SETADDR,
    BOT_LOGIN,
    BOT_QUIT,
    BOT_INFO,
    BOT_INV_SHOW,
    BOT_VIEW_SHOW,
    ACC_BOTS_INFO,
    BOT_UPDATE
}

enum BotProp {
    HEALTH = 0,
    ISONLINED,
    NOTE,
}

type BotPropValType = {
    [BotProp.HEALTH]: number,
    [BotProp.ISONLINED]: boolean,
    [BotProp.NOTE]: string,
}

interface WsMsg {
    type: any;
    payload: any;
}

interface WsMsgIntBotInfo {
    note?: string, 
    smid?: string, 
    action?: string, 
    health?:number,
    onlined:boolean
}

type WsPayloadTypes = {
    [WsMsgTypes.BOT_UPDATE]: {
        toMaster?:{  },
        toSlave?:{ username:string, prop:BotProp, value: BotPropValType[BotProp]},
    },
    [WsMsgTypes.ACC_BOTS_INFO]: {
        toMaster?:{ addr: string },
        toSlave?:{ status:boolean, reason?:string, bots?:Array<{username:string, botinfo:WsMsgIntBotInfo}> },
    },
    [WsMsgTypes.BOT_INV_SHOW]: {
        toMaster?:{ username: string },
        toSlave?:{ status:boolean, reason?:string, key?:string },
    },
    [WsMsgTypes.BOT_VIEW_SHOW]: {
        toMaster?:{ username: string },
        toSlave?:{ status:boolean, reason?:string, key?:string },
    },
    [WsMsgTypes.BOT_INFO]: {
        toMaster?:{ username: string },
        toSlave?:{ status:boolean, reason?:string, botinfo?:WsMsgIntBotInfo },
    },
    [WsMsgTypes.BOT_QUIT]: {
        toMaster?:{ username: string },
        toSlave?:{  },
    },
    [WsMsgTypes.LOGIN_CHALLENGE]: {
        toMaster?:{ addr: string },
        toSlave?:{ challenge: string },
    },
    [WsMsgTypes.LOGIN_SIGNATURE]: {
        toMaster?:{ sign: string },
        toSlave?:{ status: boolean },
    },
    [WsMsgTypes.BOT_CREATE     ]: {
        toMaster?:{ time: string, sign: string, note:string },
        toSlave?:{ status: boolean, username?: string, reason?:string },
    },
    [WsMsgTypes.DEBUG_SETADDR  ]: {
        toMaster?:{ addr: string },
        toSlave?:{  },
    },
    [WsMsgTypes.BOT_LOGIN  ]: {
        toMaster?:{ username: string },
        toSlave?:{  },
    },
}

type WsSlaveCallback<T extends WsMsgTypes> = (payload: WsPayloadTypes[T]) => void;
type WsMasterCallback<T extends WsMsgTypes> = (data: WsData, payload: WsPayloadTypes[T]) => void;

// 创建消息格式
function createWsMsg(type: WsMsgTypes, payload: any): string {
    return JSON.stringify({
        type,
        payload
    });
}

export {
    createWsMsg,
    WsMsgTypes,
    WsMsg,
    WsSlaveCallback,
    WsMasterCallback,
    WsPayloadTypes,
    MAIN_SOCKET_PORT,
    WsMsgIntBotInfo,
    BotProp,
    BotPropValType
};
