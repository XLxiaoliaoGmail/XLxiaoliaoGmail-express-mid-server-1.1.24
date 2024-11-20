import { Server as SocketIOServer, Socket } from 'socket.io';
import { INV_PORT, INV_QUERY_KEYNAME } from '../../msgFormat/const';
import { BotData } from '../Account';
import { invIOListen } from './invOListen'
import { generateKey } from '../common';

const invDataMap = new Map<string|Socket|BotData, InvData>;
export let invServer: InvServer
export class InvServer {

    static init(){
        invServer = new InvServer()
    }
    private _io: SocketIOServer;
    
    private get io() { return this._io!; }
    private set io(v: SocketIOServer) { this._io = v; }
    constructor() {
        this._io = new SocketIOServer(INV_PORT, {
            cors:{
                origin: `http://127.0.0.1:8080`,
                methods: ["GET", "POST"],
            }
        });

        this.setupConnectionListener();
        this.log(`Start listening port:[${INV_PORT}]`)
    }

    private log(msg:string) {
        console.log(`[InvServer]:${msg}`)
    }

    public registerBot(botData:BotData) {
        const key = generateKey(16)
        new InvData(key, botData)
        this.log(`Bot registered. username:[${botData.username}] key:[${key}]`)
        return key
    }
 
    public removeBot(key: string|BotData|Socket) {
        const invData = invDataMap.get(key)
        if(!invData)
            return
        invData.kill()
    }

    // 配置连接监听器，等待未来动态加入的机器人
    private setupConnectionListener(): void {
        this.io.on('connection', (socket: Socket) => {
            const key = socket.handshake.query[INV_QUERY_KEYNAME] as string
            if(!key)
                return
            const botData = invDataMap.get(key)?.botData
            if(!botData) {
                this.log(`${socket.handshake.address} try to access with non-registered key.`)
                return
            }
            if(invDataMap.get(key)!.occupied){
                this.log(`${socket.handshake.address} try to access but key is occupied.`)
                return
            }
            invDataMap.get(key)!.occupied = true
            this.log(`Bot connected. username:[${botData.username}]`)
            invIOListen(botData.botControler.bot, socket)
            socket.on('disconnect', () => {
                if(invDataMap.get(socket))
                    invDataMap.get(socket)!.kill()
            })
        });
    }
}

class InvData {
    private _key: string;
    private _socket?: Socket;
    private _botData: BotData;
    private _occupied: boolean;
    
    public  get occupied() { return this._occupied!; }
    public  set occupied(v: boolean) { this._occupied = v; }
    public  get botData() { return this._botData!; }
    private set botData(v: BotData) { this._botData = v; }
    public  get socket() { return this._socket!; }
    public  set socket(v: Socket) { this._socket = v; invDataMap.set(v, this) }
    public  get key() { return this._key!; }
    private set key(v: string) { this._key = v; }

    constructor(key:string, botData:BotData) {
        this._key = key
        this._botData = botData
        this._occupied = false
        invDataMap.set(key, this)
        invDataMap.set(botData, this)        
    }

    kill() {
        invDataMap.delete(this.key)
        invDataMap.delete(this.socket)
        invDataMap.delete(this.botData)
    }
}

export { InvServer as InventoryServer };
