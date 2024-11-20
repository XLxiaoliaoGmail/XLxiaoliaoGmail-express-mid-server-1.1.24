// server.ts

import express from 'express';
import http, { Server } from 'http';
import { WsMsgMaster } from './src/WsMsgMaster';
import { MAIN_SOCKET_PORT } from './msgFormat/wsMsgFormat';
import { InvServer } from './src/InvServer/InvServer';
import { Cmd } from './src/Cmd';
import { AccData } from './src/Account';

const app = express();
export const SELF_ADDR = 'localhost'
export const MC_SERVER_ADDR = 'localhost'
export const MC_SERVER_PORT = 25565

// npm run dev

const server: Server = http.createServer(app);

WsMsgMaster.init(server);
InvServer.init()
AccData.load()

server.listen(MAIN_SOCKET_PORT, () => {
    console.log(`SocketServer listening: http://localhost:${MAIN_SOCKET_PORT}`);
}); 

app.use(express.static('./public'));

process.on('SIGINT', exitManager);
process.on('SIGTERM', exitManager);

export function exitManager() {
    console.log('exit');
    process.exit(0);
}

Cmd.init()
