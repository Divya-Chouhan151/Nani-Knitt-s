import { createSignal, For, Show } from "solid-js";
import { ProductImage } from "../../../types/product";

export interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
}

export function ProductGallery(props: ProductGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = createSignal(0);

  const activeImage = () => {
    if (!props.images || props.images.length === 0) {
      return null;
    }
    const idx = activeImageIndex();
    return props.images[idx] || props.images[0];
  };

  return (
    <div class="flex flex-col gap-4">
      {/* Main Image Stage */}
      <div class="relative w-full aspect-square rounded-2xl overflow-hidden bg-[var(--bg-surface)] border border-[var(--border)] group">
        <Show
          when={activeImage()}
          fallback={
            <div class="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">
              No image available
            </div>
          }
        >
          {(img) => (
            <img
              data-testid="main-product-image"
              src={img().url}
              alt={img().altText || props.title}
              class="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            />
          )}
        </Show>

        <div class="absolute bottom-3 right-3 bg-[var(--bg-page)]/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-[var(--text-primary)] border border-[var(--border)] shadow-sm">
          {activeImageIndex() + 1} / {props.images.length || 1}
        </div>
      </div>

      {/* Multi-angle Thumbnails Carousel / Strip */}
      <Show when={props.images && props.images.length > 1}>
        <div class="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          <For each={props.images}>
            {(image, index) => (
              <button
                type="button"
                onClick={() => setActiveImageIndex(index())}
                class={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                  activeImageIndex() === index()
                    ? "border-[var(--brand-600)] ring-2 ring-[var(--brand-500)]/40 scale-95"
                    : "border-[var(--border)] opacity-70 hover:opacity-100"
                }`}
                aria-label={`Select image angle ${index() + 1}`}
              >
                <img
                  src={image.url}
                  alt={image.altText || `${props.title} thumbnail ${index() + 1}`}
                  loading="lazy"
                  class="w-full h-full object-cover object-center"
                />
              </button>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
