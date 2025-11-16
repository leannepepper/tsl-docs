"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { WebGPURenderer, MeshBasicNodeMaterial, TSL } from "three/webgpu";

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const rendererRef = useRef<any | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;

    const renderer = new WebGPURenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100) as any;
    camera.position.set(0, 0, 3);

    // Fullscreen plane with TSL node material
    const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

    // Diamond gradient + subtle vertical blend
    const {
      color,
      mix,
      uv,
      oscSine,
      time,
      vec2,
      abs,
      add,
      oneMinus,
      saturate,
      smoothstep,
    } = TSL as any;
    const timeSignal = time;
    const topColor = color(0x2b4b85);
    const bottomColor = color(0x0e2448);

    // base vertical gradient with gentle motion
    const v = uv().y.add(oscSine(timeSignal).mul(0.05));

    // diamond factor based on L1 distance from center (produces a diamond shape)
    const p = uv().sub(vec2(0.5, 0.48));
    const l1 = add(abs(p.x), abs(p.y));
    const diamond = saturate(oneMinus(l1.mul(1.6))); // 1 at center → 0 at edges in a diamond
    const diamondSoft = smoothstep(0.0, 1.0, diamond);

    const nodeMaterial = new MeshBasicNodeMaterial();
    // combine vertical gradient with diamond mask for a bright center
    const blend = saturate(v.mul(0.6).add(diamondSoft.mul(0.8)));
    nodeMaterial.colorNode = mix(bottomColor, topColor, blend);

    const mesh = new THREE.Mesh(geometry, nodeMaterial) as any;
    scene.add(mesh);

    const onResize = () => {
      const { clientWidth, clientHeight } = canvas.parentElement!;
      const width = clientWidth;
      const height = clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();

      // Scale the plane to cover the viewport
      const distance = (camera as any).position.z;
      const fov = (camera.fov * Math.PI) / 180;
      const viewHeight = 2 * Math.tan(fov / 2) * distance;
      const viewWidth = viewHeight * camera.aspect;
      (mesh as any).scale.set(viewWidth, viewHeight, 1);
    };
    onResize();
    window.addEventListener("resize", onResize);

    const tick = () => {
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      try {
        // @ts-expect-error setAnimationLoop exists on WebGPURenderer
        renderer.setAnimationLoop && renderer.setAnimationLoop(null);
      } catch {}
      try {
        renderer.dispose();
      } catch {}
      rendererRef.current = null;
    };
  }, []);

  return <canvas ref={canvasRef} className="home-hero__bg-canvas" />;
}
