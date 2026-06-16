"use client";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import { getEffectConfig } from "@/lib/effectsConfig";

interface GlobalEffectRendererProps {
  initialEffect?: string;
}

export default function GlobalEffectRenderer({ initialEffect = "none" }: GlobalEffectRendererProps) {
  const [init, setInit] = useState(false);
  const [effectId, setEffectId] = useState(initialEffect);

  // Update effectId if initialEffect prop changes (from server side re-render)
  useEffect(() => {
    setEffectId(initialEffect);
  }, [initialEffect]);

  // Initialize tsParticles engine
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // loadFull loads all plugins, shapes, and updaters
      await loadFull(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  // Listen for custom events from the admin dashboard for instant preview without reload
  useEffect(() => {
    const handleEffectChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setEffectId(customEvent.detail);
    };

    window.addEventListener("effectChange", handleEffectChange);

    return () => {
      window.removeEventListener("effectChange", handleEffectChange);
    };
  }, []);

  if (!init || effectId === "none") {
    return null;
  }

  const options = getEffectConfig(effectId);

  // Use a stable key so Particles completely re-mounts and resets when the effect changes
  return (
    <div className="fixed inset-0 pointer-events-none z-9999">
      <Particles id="tsparticles-global" key={effectId} options={options} />
    </div>
  );
}
