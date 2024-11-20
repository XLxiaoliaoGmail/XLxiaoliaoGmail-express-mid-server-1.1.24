// import io from 'socket.io-client';

// class ViewDrawer {
//     private canvas: HTMLCanvasElement;
//     private ctx: CanvasRenderingContext2D;
//     private socket: SocketIOClient.Socket;

//     constructor(canvasId: string, socketUrl: string) {
//         // 获取canvas元素和上下文
//         this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
//         this.ctx = this.canvas.getContext('2d')!;
//         // 连接到Socket.IO服务器
//         this.socket = io(socketUrl);

//         // 监听来自服务器的图像数据
//         this.socket.on('stream', this.handleSocketMessage.bind(this));
//     }

//     private handleSocketMessage(imageData: ArrayBuffer) {
//         const img = new Image();
//         const blob = new Blob([imageData]);
//         const imgUrl = URL.createObjectURL(blob);
//         img.onload = () => {
//             // 清除之前的内容并绘制新图像
//             this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
//             this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
//         };
//         img.src = imgUrl;
//     }

//     // 打开Socket.IO连接
//     public connect() {
//         this.socket.on('connect', () => {
//             console.log('Socket.IO连接已建立');
//         });
//     }

//     // 关闭Socket.IO连接
//     public disconnect() {
//         if (this.socket.connected) {
//             this.socket.disconnect();
//         }
//     }
// }
