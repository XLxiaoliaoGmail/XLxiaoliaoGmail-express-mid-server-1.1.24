// public\js\authorize.js

import { DEBUG } from "../../../debug"
import { WsMsgTypes } from "../../../msgFormat/wsMsgFormat"
import { web3Account } from "../Web3Account"
import { wsMsgSlave } from "../WsMsgSlave"

async function authorize() {
    return new Promise<void>(async(resolve) => {
        document.getElementById('login-button')!.addEventListener("click", handleLogin )
        async function handleLogin() {
            wsMsgSlave.send( WsMsgTypes.LOGIN_CHALLENGE, {toMaster: {addr: web3Account.walletAddr}}, async (payload) => {
                if(DEBUG){
                    resolve()
                    return
                }
                const challenge = payload.toSlave!.challenge
                console.log(`Received challenge: ${challenge}`)
                const signedChallenge = await web3Account.sign(challenge)

                wsMsgSlave.send( WsMsgTypes.LOGIN_SIGNATURE,  {toMaster: {sign: signedChallenge}}, (payload) => {
                    if(payload.toSlave!.status){
                        console.log("Login successful!")
                        document.getElementById('login-button')!.removeEventListener("click", handleLogin)
                        resolve()
                        return
                    }
                })
            })
        }
    })
}

export {
    authorize
}