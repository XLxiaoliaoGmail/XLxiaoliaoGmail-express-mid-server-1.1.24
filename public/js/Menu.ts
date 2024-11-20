// public\js\Menu.ts

import { Dom } from "./Dom";
import { botManager, BotManager } from "./dashboard/BotManager";
import ReactDOM from 'react-dom/client';
import { Editor } from "./statemachine/Editor";

enum MenuState {
    MANAGER = 0,
    STATEMACHINE,
}

class Menu {
    private _status: MenuState;
    
    private get status() { return this._status!; }
    private set status(v: MenuState) { this._status = v; }
    constructor() {
        this.createBasicHTML()
        // BotManager.init()
        Editor.init()
        this._status = MenuState.STATEMACHINE
    }

    clearPre(){
        switch (this.status) {
            case MenuState.MANAGER:
                
                break;
            case MenuState.STATEMACHINE:
                Editor.clear()
                break;
        
            default:
                break;
        }
    }

    createBasicHTML() {
        Dom.removeCSS('login.css')
        Dom.loadCss('menu.css');
        Dom.loadCss('manager.css');
        Dom.loadCss('statemachine.css');
        
        // Create Main App Container
        const container = Dom.container!
        container.innerHTML = ''; // clear previous content if reloading
    
        // Create Sidebar and Main Content Areas
        const sidebar = Dom.addElmt(container, 'div', 'sidebar');
        const contentArea = Dom.addElmt(container, 'div', 'content-area');
    
        // Sidebar Toggle and Resize Handle
        const toggleBtn = Dom.addElmt(sidebar, 'button', 'toggle-btn');
        toggleBtn.innerText = '≡';
        toggleBtn.onclick = () => sidebar.classList.toggle('collapsed');
    
        // Add Menu Items
        const menu = [
            {
                label:'首页',
                load: async ()=>{
                    contentArea.innerHTML = '';
                    Dom.addElmt(contentArea, 'div', 'page-content', undefined, '欢迎来到首页!')
                }
            },
            {
                label:'机器人管理',
                load: async ()=>{
                    contentArea.innerHTML = '';
                    BotManager.init()
                }
            },
            {
                label:'状态机编辑',
                load: async () => {
                    contentArea.innerHTML = '';
                    Editor.init()
                }
            },
            {
                label:'监控',
                load: async ()=>{
                    contentArea.innerHTML = '';
                    Dom.addElmt(contentArea, 'div', 'page-content', undefined, '这是监控页面。')
                }
            },
        ];
        
        menu.forEach(item => {
            const menuItem = Dom.addElmt(sidebar, 'button', 'menu-item');
            menuItem.innerText = item.label;
            menuItem.onclick = () => { this.clearPre(); item.load()};
        });
    }
}

export {
    Menu
}