// global.d.ts
declare global {
    interface Window {
        ethereum: {
            request: (args: { method: string; params: any[] }) => Promise<any>;
            on: (event: string, handler: (...args: any[]) => void) => void;
        };
    }
    interface EthereumProvider {
        request: (args: { method: string; params?: any[] }) => Promise<any>;
        on: (event: string, handler: (...args: any[]) => void) => void;
    }
}

// 确保文件被视为模块
export {};
