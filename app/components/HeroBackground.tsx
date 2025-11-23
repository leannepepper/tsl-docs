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
      ".home-hero"
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

    // Space-inspired background gradient only
    const {
      color,
      mix,
      uv,
      vec2,
      length,
      smoothstep,
      oneMinus,
      saturate,
      uniform,
    } = TSL as any;
    const docsProgress = uniform(0.0);
    // base vertical gradient (static)
    const baseTop = color(0x08183a); // deep navy
    const baseBottom = color(0x044a4a); // teal
    const verticalFade = smoothstep(0.0, 1.0, uv().y.mul(0.9).add(0.08));
    const baseGradient = mix(baseBottom, baseTop, verticalFade);

    // soft diagonal glow in the lower-right
    const uvCoord = uv();
    // teal highlight spot, static position
    const glowCenter = vec2(0.9, 0.4);
    const glowVec = uvCoord.sub(glowCenter);
    const glowDist = length(glowVec.mul(vec2(1.6, 2.2)));
    const glowMask = oneMinus(saturate(smoothstep(0.08, 0.7, glowDist)));

    const glowOuter = color(0x07545a); // slightly deeper, less saturated teal
    const glowInner = color(0x4ac6e0); // softer cyan for a smoother blend
    const glowColor = mix(glowOuter, glowInner, glowMask);

    // when at the top of the page, show the teal glow;
    // as the user scrolls down, fade the glow out and replace it with a darker blue
    const glowStrength = oneMinus(saturate(docsProgress));
    const glowLit = mix(
      baseGradient,
      glowColor,
      glowMask.mul(0.6).mul(glowStrength)
    );

    const glowFadeColor = color(0x020819); // darker blue replacement in docs view
    const glowFadeStrength = saturate(docsProgress);
    const withGlow = mix(
      glowLit,
      glowFadeColor,
      glowMask.mul(0.4).mul(glowFadeStrength)
    );

    // darker blue focus in the upper-left corner
    const cornerCenter = vec2(0.02, 0.08);
    const cornerVec = uvCoord.sub(cornerCenter);
    const cornerDist = length(cornerVec.mul(vec2(1.3, 1.1)));
    const cornerMask = oneMinus(saturate(smoothstep(0.0, 0.8, cornerDist)));
    const cornerColor = color(0x000317);
    const withCornerShade = mix(withGlow, cornerColor, cornerMask.mul(1.0));

    // vignette to keep focus near center and soften edges
    const vignette = smoothstep(
      0.1,
      0.95,
      length(uv().sub(vec2(0.5, 0.45)).mul(1.4))
    );
    const vignetted = mix(withCornerShade, color(0x000006), vignette);
    const finalColor = vignetted;

    const nodeMaterial = new MeshBasicNodeMaterial();
    nodeMaterial.colorNode = finalColor;

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
        Math.max(0, (window.scrollY - heroTop) / range)
      );
      const shift = progress * heroSection.offsetHeight;
      const shiftValue = `${shift}px`;
      canvas.style.setProperty("--hero-bg-shift", shiftValue);
      hostElement?.style.setProperty("--hero-bg-shift", shiftValue);
      docsProgress.value = progress;
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
