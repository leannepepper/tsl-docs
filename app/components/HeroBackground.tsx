"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { WebGPURenderer, MeshBasicNodeMaterial, TSL } from "three/webgpu";

type HeroBackgroundProps = {
  variant?: "home" | "docs";
};

export default function HeroBackground({ variant = "home" }: HeroBackgroundProps) {
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
    const scrollRoot =
      (hostElement?.closest(".home-shell") as HTMLElement | null) ?? null;

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
    const glowEnabled = uniform(variant === "home" ? 1.0 : 0.0);
    // base vertical gradient (static)
    const baseTop = color(0x08183a); // deep navy
    const baseBottom = color(0x044a4a); // teal
    const verticalFade = smoothstep(0.0, 1.0, uv().y.mul(0.9).add(0.08));
    const baseGradient = mix(baseBottom, baseTop, verticalFade);

	    // soft diagonal glow toward the bottom-right
	    const uvCoord = uv();
	    // teal highlight spot, static position (bottom-right)
	    const glowCenter = vec2(0.9, 0.18);
	    const glowVec = uvCoord.sub(glowCenter);
	    const glowDist = length(glowVec.mul(vec2(1.4, 1.9)));
	    const glowMask = oneMinus(saturate(smoothstep(0.0, 0.9, glowDist)));

	    const glowOuter = color(0x04545a); // outer teal, close to base
	    const glowInner = color(0x2a8ea9); // slightly darker, softer teal
	    const glowColor = mix(glowOuter, glowInner, glowMask);

	    // brighten the center and smoothly blend into the base gradient,
	    // while gently dimming the glow as you scroll into the docs.
	    const glowStrength = glowEnabled.mul(
        oneMinus(saturate(docsProgress.mul(1.2)))
      );
	    const glowFactor = glowMask.mul(glowMask).mul(0.5).mul(glowStrength);
	    const withGlow = mix(baseGradient, glowColor, glowFactor);

    // darker blue focus in the upper-left corner
    const cornerCenter = vec2(0.02, 0.08);
    const cornerVec = uvCoord.sub(cornerCenter);
    const cornerDist = length(cornerVec.mul(vec2(1.3, 1.1)));
    const cornerMask = oneMinus(saturate(smoothstep(0.0, 0.8, cornerDist)));
    const cornerColor = color(0x000317);
    const withCornerShade = mix(withGlow, cornerColor, cornerMask.mul(1.0));

	    // vignette to keep focus near center and soften edges,
	    // but ease it out toward the bottom so the teal glow
	    // can reach the lower corners.
	    const vignetteRadius = length(uv().sub(vec2(0.5, 0.45)).mul(1.4));
	    const baseVignette = smoothstep(0.1, 0.95, vignetteRadius);
	    const bottomEase = smoothstep(0.18, 0.45, uv().y);
	    const vignette = baseVignette.mul(bottomEase);
	    const vignetted = mix(withCornerShade, color(0x000006), vignette);
    const finalColor = vignetted;

    const nodeMaterial = new MeshBasicNodeMaterial();
    nodeMaterial.colorNode = finalColor;

    const mesh = new THREE.Mesh(geometry, nodeMaterial) as any;
    scene.add(mesh);

    const updateScrollProgress = () => {
      if (!heroSection) return;
      const scrollTop = scrollRoot ? scrollRoot.scrollTop : window.scrollY;
      const containerOffset = scrollRoot ? scrollRoot.offsetTop : 0;
      const heroTop = heroSection.offsetTop - containerOffset;
      const docsTop =
        (docsSection ? docsSection.offsetTop - containerOffset : undefined) ??
        heroTop + heroSection.offsetHeight;
      const range = Math.max(1, docsTop - heroTop);
      const progress = Math.min(
        1,
        Math.max(0, (scrollTop - heroTop) / range)
      );
      docsProgress.value = progress;
    };

    const onResize = () => {
      const width = window.innerWidth || canvas.clientWidth;
      const height = window.innerHeight || canvas.clientHeight;
      renderer.setSize(width, height, false);
      const aspect = width / Math.max(1, height);

      camera.left = -aspect;
      camera.right = aspect;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();

      // stretch horizontally to fill viewport while keeping clip-space coverage
      (mesh as any).scale.set(aspect, 1, 1);
      updateScrollProgress();
    };
    onResize();
    window.addEventListener("resize", onResize);

    const onScroll = () => {
      if (scrollRafRef.current !== null) return;
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = null;
        updateScrollProgress();
      });
    };
    updateScrollProgress();
    const scrollTarget: HTMLElement | Window = scrollRoot ?? window;
    scrollTarget.addEventListener("scroll", onScroll, { passive: true } as any);

    const tick = () => {
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      scrollTarget.removeEventListener("scroll", onScroll);
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
      try {
        // @ts-expect-error setAnimationLoop exists on WebGPURenderer
        renderer.setAnimationLoop && renderer.setAnimationLoop(null);
      } catch {}
      try {
        renderer.dispose();
      } catch {}
      rendererRef.current = null;
    };
  }, [variant]);

  return <canvas ref={canvasRef} className="home-hero__bg-canvas" />;
}
