declare module 'three/examples/js/controls/OrbitControls' {
    import { Camera, Scene, Vector3, WebGLRenderer } from 'three';
    
    export class OrbitControls {
      constructor(camera: Camera, domElement: HTMLElement);
      object: Camera;
      domElement: HTMLElement;
      enabled: boolean;
      target: Vector3;
      minDistance: number;
      maxDistance: number;
      minPolarAngle: number;
      maxPolarAngle: number;
      enableDamping: boolean;
      dampingFactor: number;
      enableZoom: boolean;
      enableRotate: boolean;
      rotateSpeed: number;
      zoomSpeed: number;
      panSpeed: number;
      enableKeys: boolean;
      keys: { LEFT: number, UP: number, RIGHT: number, BOTTOM: number };
  
      update(): void;
      dispose(): void;
    }
  }
  