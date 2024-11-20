// src\BotControler.ts

import mineflayer, { Bot } from "mineflayer";
import { BotData } from "./Account";
import { invServer } from "./InvServer/InvServer";

const mcServerAddr = 'localhost'
const mcServerPort = 25565

class BotController {
    private static queue: Array<() => void> = [];
    private static isProcessing = false;

    private _bot?: Bot;
    private _botData: BotData;
    private _timeoutId?: NodeJS.Timeout;
    
    private get timeoutId() { return this._timeoutId!; }
    private set timeoutId(v: NodeJS.Timeout) { this._timeoutId = v; }
    private get botData() { return this._botData!; }
    private set botData(v: BotData) { this._botData = v; }
    public  get bot() { return this._bot!; }
    private set bot(v: Bot) { this._bot = v; }
    
    constructor(botData: BotData, loginResolve: (value: boolean | PromiseLike<boolean>) => void) {
        this._botData = botData;

        BotController.enqueue(() => this.createBot(botData, loginResolve));
    }

    private static enqueue(task: () => void) {
        this.queue.push(task);
        this.processNext();
    }

    private static processNext() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;
        const nextTask = this.queue.shift();
        if (nextTask) {
            nextTask();
        }
    }

    private createBot(botData: BotData, loginResolve: (value: boolean | PromiseLike<boolean>) => void, timeout?:number) {

        this.timeoutId = setTimeout(() => {
            this.log(`Login failed due to timeout`);
            loginResolve(false);
            this.taskFinished();
        }, timeout ?? 3000);

        this.log(`Try to login`);

        try {
            this._bot = mineflayer.createBot({
                host: mcServerAddr,
                port: mcServerPort,
                username: `${this.botData.username}`,
            });
        } catch (error) {
            console.log('Error:', error);
            clearTimeout(this.timeoutId!);
            loginResolve(false);
            this.taskFinished();
            return;
        }

        this._bot.once('spawn', () => {
            clearTimeout(this.timeoutId!);
            loginResolve(true);
            this.log(`Login successfully`);
            this.taskFinished();
            // setTimeout(() => {
            //     this.taskFinished();
            // }, 100);
        });

        this._bot.on('end', () => {
            if (this.botData.invShown) {
                invServer.removeBot(botData);
                this.botData.invShown = false;
            }
        });
    }

    private taskFinished() {
        this.log('Task finished')
        BotController.isProcessing = false;
        BotController.processNext();
    }

    quit() {
        if(this._bot){
            this._bot.quit()
            this.log(`Quit successfully`)
        }
    }

    log(message?: any, ...optionalParams: any[]) {
        console.log(`From bot[${this._botData.username}]: ${message}`, ...optionalParams)
    }
}


export {
    BotController
}