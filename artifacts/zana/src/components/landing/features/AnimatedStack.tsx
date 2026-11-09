import type { CSSProperties, ReactNode } from 'react';

type AnimatedStackProps<T> = {
  /** Newest first. Pass `visible + 1` items so the oldest can fade out. */
  items: T[];
  getKey: (item: T) => string | number;
  render: (item: T) => ReactNode;
  itemHeight: number;
  gap?: number;
  visible: number;
};

// A vertical list where new items slide in at the top and older ones glide down.
// Each item is positioned absolutely, so moving it is a cheap transform transition.
export default function AnimatedStack<T>({ items, getKey, render, itemHeight, gap = 10, visible }: AnimatedStackProps<T>) {
  const step = itemHeight + gap;

  return (
    <div className="relative w-full" style={{ height: visible * step - gap }}>
      {items.map((item, i) => (
        <div
          key={getKey(item)}
          className="zf-stack-item absolute inset-x-0 top-0"
          style={
            {
              height: itemHeight,
              '--y': `${i * step}px`,
              transform: 'translateY(var(--y))',
              opacity: i < visible ? 1 : 0,
            } as CSSProperties
          }
        >
          {render(item)}
        </div>
      ))}
    </div>
  );
}
