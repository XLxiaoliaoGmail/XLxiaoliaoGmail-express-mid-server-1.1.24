import { throttle } from 'lodash';
import { getWinCoor } from './winCoor';
import { SERVER_ADDR } from '../client';
import { INV_PORT, INV_QUERY_KEYNAME } from '../../../msgFormat/const';
import io from "socket.io-client";

const winCoor = getWinCoor()

interface Slot {
    texture: string | null;
    count: number;
    durabilityLeft: number | null;
    slot: number;
}

interface BotWindow {
    type: string;
    slots: Record<string, Slot | null>;
}

const drawWindowThrottleTime = 100

export class InvDrawer {

    private _canvas: HTMLCanvasElement;
    private _botWindow?: BotWindow;
    private _socket: SocketIOClient.Socket;
    
    private get socket() { return this._socket!; }
    private set socket(v: SocketIOClient.Socket) { this._socket = v; }
    private get botWindow() { return this._botWindow!; }
    private set botWindow(v: BotWindow) { this._botWindow = v; }
    private get canvas() { return this._canvas!; }
    private set canvas(v: HTMLCanvasElement) { this._canvas = v; }

    constructor(canvas: HTMLCanvasElement, key:string) {
        this._canvas = canvas
        // Initialize socket connection
        this._socket = io(`http://${SERVER_ADDR}:${INV_PORT}`, {
            query: { [INV_QUERY_KEYNAME]:key },
        });
        console.log(`Try connecting, addr:[${SERVER_ADDR}], port:[${INV_PORT}]`)
        this.setup();
    }

    private async setup() {
        
        this.socket.on('window', (botWindow: BotWindow) => {
            console.log(`recieve window`, window)
            this.botWindow = botWindow;
            this.drawWindow(this.botWindow);
        });

        this.socket.on('windowUpdate', (windowUpdate: Partial<BotWindow>) => {
            if (this.botWindow) {
                this.botWindow = { ...this.botWindow, ...windowUpdate };
                this.drawWindow(this.botWindow);
            }
        });
    }

    // Throttled function to draw the window
    private drawWindow = throttle(async (botWindow: BotWindow | null) => {
        if (!botWindow || !this.canvas) return;

        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;

        // Draw background image
        const windowImage = new Image();
        windowImage.src = `windows/${botWindow.type ?? 'inventory'}.png`;
        windowImage.onload = () => {
            this.canvas.width = windowImage.width;
            this.canvas.height = windowImage.height;
            ctx.drawImage(windowImage, 0, 0);

            // Draw slots
            for (const slot in botWindow.slots) {
                const slotData = botWindow.slots[slot];
                if (!slotData) continue;

                const slotCoordinates = winCoor[botWindow.type]?.[slotData.slot];
                if (slotData.texture && slotCoordinates) {
                    const slotImage = new Image();
                    slotImage.src = slotData.texture;

                    slotImage.onload = () => {
                        // Draw slot image
                        ctx.imageSmoothingEnabled = false;
                        ctx.drawImage(slotImage, slotCoordinates[0], slotCoordinates[1], 32, 32);

                        // Draw slot count
                        if (slotData.count > 1) {
                            ctx.font = '20px monospace';
                            ctx.fillStyle = 'black';
                            ctx.textAlign = 'end';
                            ctx.fillText(slotData.count.toString(), slotCoordinates[0] + 33, slotCoordinates[1] + 31);
                            ctx.fillStyle = 'white';
                            ctx.fillText(slotData.count.toString(), slotCoordinates[0] + 32, slotCoordinates[1] + 30);
                        }

                        // Draw slot durability (if any)
                        if (slotData.durabilityLeft != null) {
                            ctx.fillStyle = 'black';
                            ctx.fillRect(slotCoordinates[0] + 3, slotCoordinates[1] + 29, 28, 3);
                            ctx.fillStyle = `hsl(${Math.round(slotData.durabilityLeft * 120)}, 100%, 50%)`;
                            ctx.fillRect(slotCoordinates[0] + 3, slotCoordinates[1] + 29, Math.round(slotData.durabilityLeft * 28), 2);
                        }
                    };
                }
            }
        };
    }, drawWindowThrottleTime);

    // Cleanup and disconnect on page unload
    public cleanup() {
        this.socket.disconnect();
    }
}
