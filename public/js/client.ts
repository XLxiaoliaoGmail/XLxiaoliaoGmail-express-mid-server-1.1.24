// public/js/client.js

import { MAIN_SOCKET_PORT } from "../../msgFormat/wsMsgFormat";
import { Menu } from "./Menu";
import { Dom } from "./Dom";
import { authorize } from "./login/authorize";
import { connectWeb3Wallet } from "./login/connectWeb3Wallet";
import { generateLoginHTML } from "./login/generateLoginHTML";
import { WsMsgSlave } from "./WsMsgSlave";
 
// npm run watch 
export const SERVER_ADDR = '127.0.0.1'
const WS_ADDR = SERVER_ADDR
const WS_PORT = MAIN_SOCKET_PORT
export const WS_URL = `ws://${WS_ADDR}:${WS_PORT}`

document.addEventListener('DOMContentLoaded', async () => {
    Dom.init()
    generateLoginHTML()
    await connectWeb3Wallet()
    await WsMsgSlave.init()
    await authorize()
    new Menu()
});
