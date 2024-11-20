# 项目概述

## 公共部分

### msgFormat\wsMsgFormat.ts
客户端和服务端均引用这一文件作为通信模板，保证通信格式一致

## 服务端部分

### server.ts
服务器入口文件，使用Express创建HTTP服务器，以及各种模块的初始化

### src\Account.ts
用于账户和机器人数据的管理。AccData 类处理账户的加载、保存及与机器人数据的关联；BotData 类管理单个机器人的状态、登录和退出等功能

### src\BotControler.ts
每个在线的机器人都会绑定一个BotControler实例，用于登录与控制机器人，其中express服务器和minecraft服务器的通信（例如机器人登录与控制）使用已有的npm库，在早期版本中还有接受按键监听以控制机器人的功能，现已移除

### src\Cmd.ts
在服务器运行时监听并执行指令

### src\common.ts
公用函数集，目前只有“生成随机密钥”的功能

### src\WsMsgMaster.ts
全称websocket message manager master，在本工程中，通信双方均分为master和slave，master均在初始化时就设定好所有监听器，slave一般使用一次性监听器（例如请求某数据时，发送消息后立即开启监听，收到消息执行后立刻销毁），master还需要管理多个slave的socket实例，与其真实账户对应。服务端处理客户端消息的逻辑主要集中在这里，同时使用“msgFormat\wsMsgFormat.ts”统一通信格式。（此前还有主线程与子线程的通信的master与slave，我为每个“server服务器操纵的我的世界bot实例”都额外创建了一个线程，以确保主线程安全，但后来认为没比较，即删除）

### src\InvServer\InvServer.ts
这里的inv指inventory，即我的世界bot的背包页面，用户在web端请求一个密钥，使用此密钥可以跟InvServer请求某个bot的背包状态，InvServer使用socketIO发送背包状态给用户，然后在web端渲染。（此处后端数据获取与前端渲染均来自一个开源npm库，我仅做了移植）

### src\ViewServer\ViewServer.ts
功能与InvServer类似，但是发送的数据为bot周围的世界状态，然后在web端渲染。（此处后端数据获取与前端渲染均来自一个开源npm库，我仅做了移植）

## web端部分

### public\css
css文件

### public\dist
此处应该存放webpack的生成文件，但是由于调试时生成的文件直接在内存中，方便调试，故此处没有文件

### public\js\client.ts
web端脚本的入口文件，包含内容动态生成与通信初始化，并先引导用户登录，然后才进入控制界面

### public\js\login\connectWeb3Wallet.ts
连接web3钱包（需要浏览器安装web3钱包插件，例如metamask）

### public\js\login\authorize.ts
验证与登录，向服务器请求一个“挑战”，然后使用web3钱包的签名功能签名这个“挑战”，以证明身份，然后发回服务器验证，服务器验证此“挑战”确实是此“地址”的所有者签名的才算通过，验证通过后才可进入下一页面。

### public\js\Menu.ts
主菜单页面，左侧有一栏菜单栏，点击菜单栏可以选择不同页面，在右侧动态生成该页面的dom元素

### public\js\dashboard\BotManager.ts
机器人管理页面的入口文件，刚进入时会自动向服务器请求此账户的所有机器人状态，并更新在页面上，目前可以控制机器人的登录与下线，动态请求机器人的当前背包状态，以及第三人称视角，并在web渲染（此处后端数据获取与前端渲染均来自一个开源npm库，我仅做了移植）

### public\js\dashboard\InvDrawer.ts
背包数据获取与渲染（此处后端数据获取与前端渲染均来自一个开源npm库，我仅做了移植）

### public\js\dashboard\ViewDrawer.ts
第三人称视角获取与渲染（此处后端数据获取与前端渲染均来自一个开源npm库，我仅做了移植）

### public\js\dashboard\BotInfo.ts
每个机器人均有一个BotInfo实例，管理与该bot有关的dom元素，密钥，bot当前状态，InvDrawer，ViewDrawer等

### public\js\statemachine\Editor.ts
状态机编辑器（目前正在施工的部分）的入口文件，设定了鼠标按键监听与基本处理逻辑，例如点击创建一个状态，点击两个状态可以在他们之间建立连线（实际上是状态转换），状态的删除等。（状态机编辑器有一个老的版本，但是我认为他不是易用的，故重新做一个）

### public\js\statemachine\State.ts
状态管理类，主要管理状态的内在逻辑，例如此状态中bot要做什么事，此状态与其他状态的关系（可能从哪一状态进入，可能从哪一状态退出）等。

### public\js\statemachine\DomManager.ts
每个状态的dom元素管理类，每个状态都有一个DomManager实例，专管页面的绘制

### public\js\statemachine\Connection.ts
使用svg绘制的状态间连线（正在施工）

## 其他

### public\method
旧版本遗留物，目前暂无作用。与状态机有关。

### ata\pc\1.20
旧版本遗留物，目前暂无作用。与状态机有关。

### accountsData.json
账号信息，使用命令“acc save”可以保存，“acc load”加载，详见“src\Cmd.ts”