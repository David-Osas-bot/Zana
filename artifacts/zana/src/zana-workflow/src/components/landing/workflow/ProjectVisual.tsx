import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useInterval, useReducedMotion } from '../features/hooks';
import { Caret, FieldBox, FieldLabel, MockButton, MockModal, Placeholder, clamp } from './mock-ui';

const NAME = 'Website refresh';
const DESC = 'Launch the new site by March';
const END = 94;

// Step 1: the New project dialog fills itself in, then the project is created.
export default function ProjectVisual() {
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);
  useInterval(() => setTick(t => t + 1), reduced || tick >= END ? null : 60);

  const t = reduced ? END : tick;
  const name = NAME.slice(0, clamp(t - 6, 0, NAME.length));
  const desc = DESC.slice(0, clamp(t - 28, 0, DESC.length));
  const nameFocused = t >= 6 && t < 28;
  const descFocused = t >= 28 && t < 64;
  const creating = t >= 64 && t < 80;
  const created = t >= 80;

  return (
    <div className="relative flex w-full flex-col items-center gap-4">
      <div
        className="inline-flex items-center gap-2 rounded-full bg-[color:var(--z-fg)] px-3.5 py-1.5 text-[12px] font-semibold text-[color:var(--z-bg)] transition-all duration-500"
        style={{ opacity: created ? 1 : 0, transform: created ? 'translateY(0)' : 'translateY(8px)' }}
        aria-live="polite"
      >
        <Check size={13} aria-hidden />
        Project created
      </div>

      <MockModal title="New project" subtitle="Give the work a clear home." className="zw-rise">
        <FieldLabel>Project name</FieldLabel>
        <FieldBox focused={nameFocused}>
          {name ? <span className="truncate">{name}</span> : <Placeholder>e.g. Website refresh</Placeholder>}
          {nameFocused && <Caret />}
        </FieldBox>

        <div className="mt-4">
          <FieldLabel>Description</FieldLabel>
          <FieldBox focused={descFocused} className="min-h-[76px] items-start py-3">
            <span>
              {desc ? desc : <Placeholder>What does done look like?</Placeholder>}
              {descFocused && <Caret />}
            </span>
          </FieldBox>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <MockButton>Cancel</MockButton>
          <MockButton primary dim={!name}>
            {creating || created ? 'Creating…' : 'Create project'}
            <ArrowRight size={14} aria-hidden />
          </MockButton>
        </div>
      </MockModal>
    </div>
  );
}
