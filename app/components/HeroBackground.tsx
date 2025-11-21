"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { WebGPURenderer, MeshBasicNodeMaterial, TSL } from "three/webgpu";

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const rendererRef = useRef<any | null>(null);
  const scrollRafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const heroSection = document.querySelector(
      ".home-hero",
    ) as HTMLElement | null;
    const docsSection = document.getElementById("docs");
    const hostElement = canvas.parentElement as HTMLElement | null;

    const renderer = new WebGPURenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.set(0, 0, 2);

    // Fullscreen plane with TSL node material (clip-space quad)
    const geometry = new THREE.PlaneGeometry(2, 2, 1, 1);

    // Space-inspired gradient with pulsing stars
    const {
      color,
      mix,
      uv,
      oscSine,
      time,
      vec2,
      floor,
      fract,
      sin,
      dot,
      length,
      oneMinus,
      saturate,
      smoothstep,
    } = TSL as any;
    const timeSignal = time;

    // helper for randomly scattered twinkling stars
    const makeStarLayer = (
      scale: [number, number],
      radius: number,
      twinkleSpeed: number,
      intensity: number,
      shift: number
    ) => {
      const scaledUV = uv()
        .mul(vec2(scale[0], scale[1]))
        .add(vec2(shift * 0.37, shift * 0.53));
      const grid = floor(scaledUV);
      const local = fract(scaledUV);
      const seed = dot(grid, vec2(1127.1 + shift, 1111.7 + shift));
      const randA = fract(sin(seed).mul(43758.5453123));
      const randB = fract(sin(seed.add(1.123 + shift))).mul(43758.5453123);
      const randC = fract(sin(seed.add(2.357 + shift))).mul(43758.5453123);
      const starPos = vec2(randA, randB);
      const dist = length(local.sub(starPos));
      const starCore = oneMinus(smoothstep(0.0, radius, dist));
      const density = saturate(randC.sub(0.1).mul(1.0));
      const pulse = oscSine(timeSignal.mul(twinkleSpeed).add(randC.mul(6.2831)))
        .mul(0.35)
        .add(0.25);
      return starCore.mul(density).mul(pulse).mul(intensity);
    };

    const nearStars = makeStarLayer([62, 40], 0.15, 0.16, 0.75, 2.1);
    const denseStars = makeStarLayer([70, 48], 0.12, 0.4, 0.85, 0.0);
    const fineStars = makeStarLayer([120, 90], 0.08, 0.6, 0.55, 7.4);
    const starField = saturate(nearStars.add(denseStars).add(fineStars));

    // Shooting star sweeping across the sky every 30 seconds
    const cycleLength = 30.0;
    const shootingWindow = 0.03;
    const cyclePhase = fract(timeSignal.div(cycleLength));
    const appearWindow = smoothstep(0.0, 0.02, cyclePhase);
    const disappearWindow = smoothstep(
      shootingWindow - 0.02,
      shootingWindow,
      cyclePhase
    );
    const shootingVisibility = appearWindow.mul(oneMinus(disappearWindow));
    const travel = saturate(cyclePhase.div(shootingWindow));

    const shootingStart = vec2(-0.2, 0.95);
    const shootingEnd = vec2(1.15, -0.2);
    const shootingPos = mix(shootingStart, shootingEnd, travel);
    const shootingDir = shootingEnd.sub(shootingStart);
    const shootingDirNorm = shootingDir.div(length(shootingDir).add(1e-4));

    const shootingHead = oneMinus(
      smoothstep(0.0, 0.0025, length(uv().sub(shootingPos)))
    );
    const shootingTail1 = oneMinus(
      smoothstep(
        0.0,
        0.002,
        length(uv().sub(shootingPos.sub(shootingDirNorm.mul(0.009))))
      )
    ).mul(0.7);
    const shootingTail2 = oneMinus(
      smoothstep(
        0.0,
        0.005,
        length(uv().sub(shootingPos.sub(shootingDirNorm.mul(0.0175))))
      )
    ).mul(0.45);
    const shootingTail3 = oneMinus(
      smoothstep(
        0.0,
        0.0075,
        length(uv().sub(shootingPos.sub(shootingDirNorm.mul(0.0275))))
      )
    ).mul(0.25);
    const shootingTrail = shootingHead
      .add(shootingTail1)
      .add(shootingTail2)
      .add(shootingTail3);
    const shootingStar = shootingVisibility.mul(saturate(shootingTrail));

    const baseTop = color(0x0a1226);
    const baseBottom = color(0x010104);
    const verticalFade = smoothstep(
      0.0,
      1.0,
      uv()
        .y.mul(0.8)
        .add(oscSine(timeSignal.mul(0.25)).mul(0.05).add(0.1))
    );
    const baseGradient = mix(baseBottom, baseTop, verticalFade);

    const vignette = smoothstep(
      0.1,
      0.95,
      length(uv().sub(vec2(0.5, 0.45)).mul(1.4))
    );
    const spaceFog = mix(baseGradient, color(0x000006), vignette);

    const starTint = mix(
      color(0x4d72c4),
      color(0xd7e4ff),
      saturate(starField.mul(1.2))
    );
    const shootingStarColor = color(0xf4fbff);

    const nodeMaterial = new MeshBasicNodeMaterial();
    nodeMaterial.colorNode = saturate(
      spaceFog
        .add(starTint.mul(starField))
        .add(color(0xffffff).mul(starField.mul(0.2)))
        .add(shootingStarColor.mul(shootingStar.mul(1.4)))
    );

    const mesh = new THREE.Mesh(geometry, nodeMaterial) as any;
    scene.add(mesh);

    const updateScrollShift = () => {
      if (!heroSection) return;
      const heroTop = heroSection.offsetTop;
      const docsTop =
        (docsSection && docsSection.offsetTop) ??
        heroTop + heroSection.offsetHeight;
      const range = Math.max(1, docsTop - heroTop);
      const progress = Math.min(
        1,
        Math.max(0, (window.scrollY - heroTop) / range),
      );
      const shift = progress * heroSection.offsetHeight;
      const shiftValue = `${shift}px`;
      canvas.style.setProperty("--hero-bg-shift", shiftValue);
      hostElement?.style.setProperty("--hero-bg-shift", shiftValue);
    };

    const onResize = () => {
      const { clientWidth, clientHeight } = canvas.parentElement!;
      const width = clientWidth;
      const height = clientHeight;
      renderer.setSize(width, height, false);
      const aspect = width / Math.max(1, height);

      camera.left = -aspect;
      camera.right = aspect;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();

      // stretch horizontally to fill viewport while keeping clip-space coverage
      (mesh as any).scale.set(aspect, 1, 1);
      updateScrollShift();
    };
    onResize();
    window.addEventListener("resize", onResize);

    const onScroll = () => {
      if (scrollRafRef.current !== null) return;
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = null;
        updateScrollShift();
      });
    };
    updateScrollShift();
    window.addEventListener("scroll", onScroll, { passive: true });

    const tick = () => {
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
      canvas.style.removeProperty("--hero-bg-shift");
      hostElement?.style.removeProperty("--hero-bg-shift");
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
