import { Component } from "solid-js";

interface NaniKnittingLogoProps {
  class?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

export const NaniKnittingLogo: Component<NaniKnittingLogoProps> = (props) => {
  const isLarge = () => props.size !== "sm";

  return (
    <div
      class={`inline-flex items-center gap-3 select-none transition-transform duration-200 ease-out hover:scale-105 active:scale-95 ${
        props.class || ""
      }`}
      aria-label="Nani's Knitts — Handmade & Heartfelt"
    >
      {/* Animated SVG Figure: Doubled Size with On-Brand Glow & Highlight Aura on Icon Only */}
      <div
        class="relative shrink-0 flex items-center justify-center p-2 rounded-2xl bg-pink-500/15 dark:bg-pink-500/25 ring-2 ring-pink-500/40 dark:ring-pink-400/50 shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all duration-200 ease-out group-hover:ring-pink-500/60 group-hover:shadow-[0_0_28px_rgba(244,63,94,0.5)] group-hover:scale-110 active:scale-95 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          class={`flex-shrink-0 drop-shadow-[0_4px_12px_rgba(244,63,94,0.35)] ${
            isLarge() ? "h-14 w-14 sm:h-16 sm:w-16" : "h-10 w-10 sm:h-11 sm:w-11"
          }`}
          fill="none"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="naniSkin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FED7AA" />
              <stop offset="100%" stop-color="#FDBA74" />
            </linearGradient>

            <linearGradient id="naniHair" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#EDE9FE" />
              <stop offset="50%" stop-color="#DDD6FE" />
              <stop offset="100%" stop-color="#C4B5FD" />
            </linearGradient>

            <linearGradient id="naniShawl" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F472B6" />
              <stop offset="50%" stop-color="#D946EF" />
              <stop offset="100%" stop-color="#8B5CF6" />
            </linearGradient>

            <linearGradient id="needleGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FDE047" />
              <stop offset="100%" stop-color="#D97706" />
            </linearGradient>

            <linearGradient id="yarnBallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FB7185" />
              <stop offset="50%" stop-color="#E11D48" />
              <stop offset="100%" stop-color="#9F1239" />
            </linearGradient>

            {/* Keyframe Animations */}
            <style>{`
              @keyframes naniNeedleLeft {
                0%, 100% {
                  transform: rotate(-18deg);
                }
                50% {
                  transform: rotate(4deg);
                }
              }

              @keyframes naniNeedleRight {
                0%, 100% {
                  transform: rotate(18deg);
                }
                50% {
                  transform: rotate(-5deg);
                }
              }

              @keyframes naniHandLeft {
                0%, 100% {
                  transform: translate(0, 0);
                }
                50% {
                  transform: translate(1px, -1.5px);
                }
              }

              @keyframes naniHandRight {
                0%, 100% {
                  transform: translate(0, 0);
                }
                50% {
                  transform: translate(-1px, -1.5px);
                }
              }

              @keyframes naniYarnBob {
                0%, 100% {
                  transform: rotate(0deg) scale(1);
                }
                25% {
                  transform: rotate(12deg) scale(1.03);
                }
                75% {
                  transform: rotate(-10deg) scale(0.98);
                }
              }

              @keyframes naniThreadWave {
                0%, 100% {
                  d: path("M48 54 Q36 50 32 44");
                }
                50% {
                  d: path("M48 54 Q40 45 32 42");
                }
              }

              @keyframes naniClothSway {
                0%, 100% {
                  transform: rotate(0deg);
                }
                50% {
                  transform: rotate(3deg);
                }
              }

              .anim-needle-left {
                transform-origin: 22px 46px;
                animation: naniNeedleLeft 1.1s ease-in-out infinite;
              }

              .anim-needle-right {
                transform-origin: 42px 46px;
                animation: naniNeedleRight 1.1s ease-in-out infinite;
                animation-delay: -0.2s;
              }

              .anim-hand-left {
                animation: naniHandLeft 1.1s ease-in-out infinite;
              }

              .anim-hand-right {
                animation: naniHandRight 1.1s ease-in-out infinite;
                animation-delay: -0.2s;
              }

              .anim-yarn-ball {
                transform-origin: 50px 52px;
                animation: naniYarnBob 2.2s ease-in-out infinite;
              }

              .anim-thread {
                animation: naniThreadWave 1.1s ease-in-out infinite;
              }

              .anim-cloth {
                transform-origin: 32px 44px;
                animation: naniClothSway 1.8s ease-in-out infinite;
              }
            `}</style>
          </defs>

          {/* Nani Character Base */}

          {/* 1. Hair Bun behind head */}
          <ellipse cx="32" cy="11" rx="8" ry="6.5" fill="url(#naniHair)" />
          {/* Hair Pin / Needle in bun */}
          <line x1="22" y1="9" x2="42" y2="13" stroke="url(#needleGold)" stroke-width="1.6" stroke-linecap="round" />
          <circle cx="22" cy="9" r="1.5" fill="#D97706" />

          {/* 2. Cozy Knitted Shawl / Body */}
          <path
            d="M17 56 C17 38 23 29 32 29 C41 29 47 38 47 56 Z"
            fill="url(#naniShawl)"
          />
          {/* Shawl collar / texture */}
          <path
            d="M23 37 Q32 44 41 37"
            stroke="#FCE7F3"
            stroke-width="1.5"
            fill="none"
            stroke-linecap="round"
            stroke-dasharray="2 2"
          />

          {/* 3. Head & Face */}
          <circle cx="32" cy="22" r="10.5" fill="url(#naniSkin)" />

          {/* Hair front waves */}
          <path
            d="M21.5 20 C24 13 28 13 32 15 C36 13 40 13 42.5 20 C38 18 34 18 32 19 C30 18 26 18 21.5 20 Z"
            fill="url(#naniHair)"
          />

          {/* Spectacles / Glasses */}
          <circle cx="28.5" cy="22" r="3.2" stroke="#831843" stroke-width="1.1" fill="none" opacity="0.9" />
          <circle cx="35.5" cy="22" r="3.2" stroke="#831843" stroke-width="1.1" fill="none" opacity="0.9" />
          <path d="M31.7 22 L32.3 22" stroke="#831843" stroke-width="1.1" />

          {/* Cheerful smiling eyes behind glasses */}
          <path d="M27.2 21.5 Q28.5 20.3 29.8 21.5" stroke="#701A75" stroke-width="1" fill="none" stroke-linecap="round" />
          <path d="M34.2 21.5 Q35.5 20.3 36.8 21.5" stroke="#701A75" stroke-width="1" fill="none" stroke-linecap="round" />

          {/* Sweet Smile */}
          <path d="M30 26.5 Q32 28.5 34 26.5" stroke="#9D174D" stroke-width="1.1" fill="none" stroke-linecap="round" />
          {/* Rosy Cheeks */}
          <circle cx="25.5" cy="24.5" r="1.5" fill="#FB7185" opacity="0.6" />
          <circle cx="38.5" cy="24.5" r="1.5" fill="#FB7185" opacity="0.6" />

          {/* 4. Handcrafted Swatch hanging from needles */}
          <g class="anim-cloth">
            <path
              d="M28 44 Q32 46 36 44 L37 52 Q32 54 27 52 Z"
              fill="#E879F9"
              opacity="0.9"
            />
            {/* Knit ribs on swatch */}
            <line x1="30" y1="45" x2="29" y2="51" stroke="#FDF2F8" stroke-width="0.8" stroke-linecap="round" />
            <line x1="32" y1="45" x2="32" y2="52" stroke="#FDF2F8" stroke-width="0.8" stroke-linecap="round" />
            <line x1="34" y1="45" x2="35" y2="51" stroke="#FDF2F8" stroke-width="0.8" stroke-linecap="round" />
          </g>

          {/* 5. Left Knitting Needle & Animated Hand */}
          <g class="anim-needle-left">
            <line x1="20" y1="48" x2="35" y2="38" stroke="url(#needleGold)" stroke-width="2" stroke-linecap="round" />
            <circle cx="20" cy="48" r="2.2" fill="#D97706" />
          </g>
          <g class="anim-hand-left">
            <circle cx="24" cy="44" r="3" fill="url(#naniSkin)" />
          </g>

          {/* 6. Right Knitting Needle & Animated Hand */}
          <g class="anim-needle-right">
            <line x1="44" y1="48" x2="29" y2="38" stroke="url(#needleGold)" stroke-width="2" stroke-linecap="round" />
            <circle cx="44" cy="48" r="2.2" fill="#D97706" />
          </g>
          <g class="anim-hand-right">
            <circle cx="40" cy="44" r="3" fill="url(#naniSkin)" />
          </g>

          {/* 7. Working Thread Strand between needles and yarn ball */}
          <path
            d="M48 54 Q36 50 32 44"
            stroke="#E11D48"
            stroke-width="1.6"
            fill="none"
            stroke-linecap="round"
            class="anim-thread"
          />

          {/* 8. Yarn Ball resting on side */}
          <g class="anim-yarn-ball">
            <circle cx="50" cy="52" r="7.5" fill="url(#yarnBallGrad)" />
            {/* Yarn windings */}
            <path d="M45 50 Q50 46 55 50" stroke="#FFE4E6" stroke-width="1" fill="none" opacity="0.75" />
            <path d="M44 53 Q50 58 56 53" stroke="#FFE4E6" stroke-width="1" fill="none" opacity="0.75" />
            <path d="M47 46 Q51 52 47 58" stroke="#FFE4E6" stroke-width="1" fill="none" opacity="0.75" />
            <path d="M53 46 Q49 52 53 58" stroke="#FFE4E6" stroke-width="1" fill="none" opacity="0.75" />
          </g>
        </svg>
      </div>

      {/* Typography: Wordmark & Tagline - Plain styling without highlights or gradients */}
      <div class="flex flex-col">
        <span
          class={`font-bold tracking-tight leading-none text-[var(--text-primary)] font-serif ${
            isLarge() ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
          }`}
        >
          Nani's Knitts
        </span>
        {props.showTagline !== false && (
          <span
            class={`uppercase font-medium tracking-[0.2em] text-[var(--text-secondary)] mt-1 leading-none ${
              isLarge() ? "text-[10px] sm:text-[11px]" : "text-[9px]"
            }`}
          >
            handmade &amp; heartfelt
          </span>
        )}
      </div>
    </div>
  );
};
