// TODO: Remove this, use types lib
declare module "three/webgpu" {
  // Node materials
  export const MeshBasicNodeMaterial: any;
  export const TSL: any;

  // Core TSL helpers used in this project
  export const color: any;
  export const mix: any;
  export const uv: any;
  export const oscSine: any;
  export const timerLocal: any;
  export class WebGPURenderer {
    constructor(params?: any);
    setPixelRatio(dpr: number): void;
    setSize(w: number, h: number, updateStyle?: boolean): void;
    render(scene: any, camera: any): void;
    dispose(): void;
  }
}

// Minimal stub to avoid TS complaints if types are missing
declare module "three" {
  export const Scene: any;
  export const PerspectiveCamera: any;
  export const OrthographicCamera: any;
  export const PlaneGeometry: any;
  export const Mesh: any;
}
