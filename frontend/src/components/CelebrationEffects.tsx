import { createSignal, For, Show } from "solid-js";

interface Particle {
  id: number;
  emoji: string;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  xOffset: number;
}

const [particles, setParticles] = createSignal<Particle[]>([]);
let particleIdCounter = 0;
let isCelebrating = false;

export function triggerCelebration(type: "cart" | "wishlist" = "cart") {
  if (isCelebrating) return; // Prevent spam/stacking
  isCelebrating = true;

  const pool =
    type === "wishlist"
      ? ["💖", "🌸", "✨", "🎀", "💕", "⭐", "🌺"]
      : ["🌸", "🎉", "✨", "🧶", "🎀", "💖", "⭐", "🎊"];

  const newParticles: Particle[] = [];
  const count = 18;

  for (let i = 0; i < count; i++) {
    newParticles.push({
      id: ++particleIdCounter,
      emoji: pool[Math.floor(Math.random() * pool.length)],
      left: 10 + Math.random() * 80, // % from left
      top: 15 + Math.random() * 20, // % from top
      size: 16 + Math.floor(Math.random() * 16), // 16px - 32px
      duration: 1.2 + Math.random() * 0.6, // 1.2s - 1.8s
      delay: Math.random() * 0.2, // 0 - 0.2s
      xOffset: (Math.random() - 0.5) * 120, // horizontal drift
    });
  }

  setParticles(newParticles);

  setTimeout(() => {
    setParticles([]);
    isCelebrating = false;
  }, 2000);
}

export function CelebrationEffects() {
  return (
    <Show when={particles().length > 0}>
      <div
        aria-hidden="true"
        class="fixed inset-0 pointer-events-none z-[9999] overflow-hidden select-none"
      >
        <For each={particles()}>
          {(p) => (
            <span
              class="absolute inline-block animate-celebrate-drop filter drop-shadow-md"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                "font-size": `${p.size}px`,
                "animation-duration": `${p.duration}s`,
                "animation-delay": `${p.delay}s`,
                "--tw-translate-x": `${p.xOffset}px`,
              }}
            >
              {p.emoji}
            </span>
          )}
        </For>
      </div>
    </Show>
  );
}
