// public/js/authorizeMetaMask.ts

import { Web3Account, web3Account } from "../Web3Account";

async function connectWeb3Wallet(){
    return new Promise<void>(async (resolve) => {
        const authButton = document.getElementById("auth-button") as HTMLButtonElement
        const authMessage = document.getElementById("auth-message") as HTMLParagraphElement
        const networkWarning = document.getElementById("network-warning") as HTMLParagraphElement
        const infoSection = document.getElementById("info-section") as HTMLDivElement
        const accountDisplay = document.getElementById("account") as HTMLSpanElement
        const networkDisplay = document.getElementById("network") as HTMLSpanElement

        // Check if MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
            if (authButton && authMessage) {
                authButton.disabled = false;
                authMessage.textContent = "MetaMask detected";
                authMessage.style.color = "green";
            }
            console.log("MetaMask detected");
        } else {
            if (authMessage) authMessage.style.color = "red";
            console.log("MetaMask is not installed");
            return
        }

        // Check if the user is on Ethereum Mainnet
        const checkNetwork = async (): Promise<boolean> => {
            const chainId = await window.ethereum.request({ method: 'eth_chainId', params: [] });
            if (chainId === '0x1') {
                if (networkWarning) networkWarning.style.display = "none";
                return true;
            } else {
                if (networkWarning && authButton && authMessage) {
                    networkWarning.style.display = "block";
                    authButton.disabled = true;
                    authMessage.textContent = "Not Ethereum Mainnet";
                }
                return false;
            }
        };

        // Initial network check
        const networkOk = await checkNetwork();
        if (!networkOk) {
            return 
        }

        // Listen for network changes
        window.ethereum.on('chainChanged', checkNetwork);

        // Handle MetaMask authorization
        const handleAuthClick = async (): Promise<void> => {
            if (await checkNetwork()) {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts', params:[] }) as string[];
                const acc = accounts[0];
                Web3Account.init(acc)

                // Display account info
                accountDisplay.textContent = `${acc.slice(0, 6)}...${acc.slice(-4)}`;
                networkDisplay.textContent = 'Ethereum Mainnet';
                document.getElementById("auth-section")!.style.display = "none";
                infoSection.style.display = "block";
                authButton.removeEventListener("click", handleAuthClick);
                resolve();
            }
        };

        authButton.addEventListener("click", handleAuthClick);

        window.ethereum.on("disconnect", () => {
            console.log(`wallet disconnect`)
            /**
             * 
             */
        });
    });
};

export {
    connectWeb3Wallet
}