import { Dom } from "../Dom";

function generateLoginHTML(){

    Dom.loadCss('login.css')

    // 获取 container 元素
    const container = Dom.getById("container");

    // 创建并添加 login-container div
    const loginContainer = Dom.addElmt(container!, "div", "login-container");

    // 创建并添加 auth-section div
    const authSection = Dom.addElmt(loginContainer, "div", "login-auth-section");
    authSection.id = "auth-section";

    // 创建标题 h2
    const authTitle = Dom.addElmt(authSection, "h2");
    authTitle.innerText = "MetaMask Connect";

    // 创建并添加 auth-button 按钮
    const authButton = Dom.addElmt(authSection, "button", "login-button") as HTMLButtonElement;
    authButton.id = "auth-button";
    authButton.disabled = true;
    authButton.innerText = "Connect";
 
    // 创建并添加 auth-message p
    const authMessage = Dom.addElmt(authSection, "p", "login-message");
    authMessage.id = "auth-message";
    authMessage.innerText = "MetaMask not detected";

    // 创建并添加 network-warning p
    const networkWarning = Dom.addElmt(authSection, "p", "login-warning");
    networkWarning.id = "network-warning";
    networkWarning.style.display = "none";
    networkWarning.innerText = "Please switch to the Ethereum Mainnet";

    // 创建并添加 info-section div
    const infoSection = Dom.addElmt(loginContainer, "div", "login-info-section");
    infoSection.id = "info-section";
    infoSection.style.display = "none";

    // 创建并添加 info-section 内的标题 h2
    const infoTitle = Dom.addElmt(infoSection, "h2");
    infoTitle.innerText = "MetaMask Info";

    // 创建并添加 account 信息
    const accountInfo = Dom.addElmt(infoSection, "p", "login-info");
    accountInfo.innerHTML = 'Account: <span id="account"></span>';

    // 创建并添加 network 信息
    const networkInfo = Dom.addElmt(infoSection, "p", "login-info");
    networkInfo.innerHTML = 'Network: <span id="network"></span>';

    // 创建并添加 login-button 按钮
    const loginButton = Dom.addElmt(infoSection, "button", "login-button");
    loginButton.id = "login-button";
    loginButton.innerText = "Login";

    // 创建并添加 fireworksCanvas 画布
    const fireworksCanvas = Dom.addElmt(loginContainer, "canvas", "login-canvas");
    fireworksCanvas.id = "fireworksCanvas";
}

export {
    generateLoginHTML
}