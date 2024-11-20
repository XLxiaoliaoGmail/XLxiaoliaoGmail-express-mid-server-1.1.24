import readline from 'readline';
import { AccData } from './Account';
import { exitManager } from '../server';

export let cmd: Cmd
export class Cmd {
    static init(){
        cmd = new Cmd()
    }
    private rl: readline.Interface;

    constructor() {
        // 创建 readline 接口
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // 启动命令行交互
        this.startCommandListener();
    }

    // 启动命令监听
    private startCommandListener(): void {
        this.rl.question('', (command) => {
            this.executeCommand(command);
        });
    }

    // 执行命令
    private executeCommand(cmd: string): void {
        cmd = cmd.trim()
        if(cmd.length == 0)
            return
        const args = cmd.split(' ');
        switch (args[0]) {
            case 'stop':
                this.rl.close();  // 关闭 readline 接口
                exitManager()
                break;
            case 'acc':
                if(args[1] == 'save'){
                    AccData.save()
                    break
                }
                if(args[1] == 'load'){
                    AccData.load()
                    break
                }
                break; 
            default:
                console.log(`Undefined cmd: ${cmd}`);
        }
        this.startCommandListener();
    }
} 