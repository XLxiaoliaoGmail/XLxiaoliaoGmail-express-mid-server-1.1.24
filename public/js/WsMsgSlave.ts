// public/js/SocketManager.ts

import { WsMsgTypes, createWsMsg, WsMsg, WsPayloadTypes, WsSlaveCallback, MAIN_SOCKET_PORT } from '../../msgFormat/wsMsgFormat';
import { WS_URL } from './client';

let wsMsgSlave: WsMsgSlave
class WsMsgSlave {
    private socket: WebSocket;
    private initResolve: (value: void | PromiseLike<void>) => void;
    
    callbacks: Partial<Record<WsMsgTypes, WsSlaveCallback<any>>> = {};
    onceCallbacks: Partial<Record<WsMsgTypes, WsSlaveCallback<any>>> = {};

    constructor(resolve: (value: void | PromiseLike<void>) => void) {
        this.socket = new WebSocket(WS_URL);
        this.initResolve = resolve
        
        this.socket.onopen = () => {
            this.initResolve()
            console.log(`Connect successfully`)
        };
        
        this.socket.onmessage = (event) => {
            const {type, payload} = JSON.parse(event.data) as WsMsg
            this.handleMessage(type, payload);
        };

        this.socket.onclose = () => {
            console.log("WebSocket connection closed");
            location.reload()
            
        };

        this.socket.onerror = (error: Event) => {
            console.error("WebSocket error:", error);
        };
    }

    static async init(){
        return await new Promise<void>(async (resolve) => {
            console.log(`Start connecting: ${WS_URL}`)
            wsMsgSlave = new WsMsgSlave(resolve)
        })
    }

    handleMessage<T extends WsMsgTypes>(type: T, payload: WsPayloadTypes[T]) {
        const onceCallback = this.onceCallbacks[type];
        if (onceCallback) {
            onceCallback(payload);
            delete this.onceCallbacks[type];
        }
        const callback = this.callbacks[type];
        if (callback) {
            callback(payload);
        }
    }

    send<T extends WsMsgTypes>(type: T, payload: WsPayloadTypes[T], onceCallback?: WsSlaveCallback<T>): void {
        this.socket.send(createWsMsg(type, payload));
        if (onceCallback) {
            this.onceCallbacks[type] = onceCallback;
        }
    }

    on<T extends WsMsgTypes>(type: T, callback: WsSlaveCallback<T>): void {
        this.callbacks[type] = callback;
    }
}



export {
    WsMsgSlave,
    wsMsgSlave,
}