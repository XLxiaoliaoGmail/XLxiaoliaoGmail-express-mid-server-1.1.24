// public\js\Account.ts

let web3Account: Web3Account

class Web3Account {
    private _walletAddr: string;
    
    public  get walletAddr() { return this._walletAddr!; }
    private set walletAddr(v: string) { this._walletAddr = v; }
    constructor(walletAddr: string) {
        this._walletAddr = walletAddr
    }

    static init(walletAddr: string) {
        web3Account = new Web3Account(walletAddr)
    }

    
    async sign(msg: string){
        return await window.ethereum.request({
            method: 'personal_sign',
            params: [String(msg), this.walletAddr]
        })
    }
}

export {
    Web3Account,
    web3Account,
}