declare module 'prismarine-viewer/viewer' {
    export class Viewer {
      constructor(renderer: THREE.WebGLRenderer);
      camera: THREE.PerspectiveCamera;
      scene: THREE.Scene;
      setVersion(version: string): boolean;
      listen(socket: any): void;
      setFirstPersonCamera(pos: THREE.Vector3, yaw: number, pitch: number): void;
      update(): void;
    }
  
    export class Entity {
      constructor(version: string, type: string, scene: THREE.Scene);
      mesh: THREE.Mesh;
    }
  }
  