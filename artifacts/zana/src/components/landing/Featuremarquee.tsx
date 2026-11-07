import {
    Activity,
    BellRing,
    CalendarClock,
    Columns3,
    LayoutDashboard,
    Move,
    UserCheck,
    UserPlus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Item = { icon: LucideIcon; label: string };

// Everything here is something Zana does today. Edit freely, but keep it true:
// a marquee full of claims the product can't back up is worse than no marquee.
const items: Item[] = [
    { icon: Columns3, label: 'Kanban boards' },
    { icon: Move, label: 'Drag and drop' },
    { icon: CalendarClock, label: 'Due dates' },
    { icon: BellRing, label: 'Email reminders' },
    { icon: UserPlus, label: 'Team invites' },
    { icon: UserCheck, label: 'Task assignment' },
    { icon: Activity, label: 'Activity feed' },
    { icon: LayoutDashboard, label: 'Progress overview' },
];

// The strip is four identical copies of the list and the track slides left by
// exactly half of its width, so the loop never shows a seam, even on very wide
// screens. Only the first copy is exposed to screen readers.
const COPIES = 4;

const css = `
@keyframes zana-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.zana-marquee {
  -webkit-mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent);
  mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent);
}
.zana-marquee-track { animation: zana-marquee 64s linear infinite; }
.zana-marquee:hover .zana-marquee-track { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .zana-marquee { -webkit-mask-image: none; mask-image: none; }
  .zana-marquee-track { animation: none; width: auto; flex-wrap: wrap; justify-content: center; }
  .zana-marquee-copy { flex-wrap: wrap; justify-content: center; row-gap: 20px; padding-right: 0; }
  .zana-marquee-extra { display: none; }
}
`;

function Copy({ extra }: { extra: boolean }) {
    return (
        <ul
            className={`zana-marquee-copy flex shrink-0 items-center gap-14 pr-14 ${extra ? 'zana-marquee-extra' : ''}`}
            aria-hidden={extra || undefined}
        >
            {items.map(({ icon: Icon, label }) => (
                <li
                    key={label}
                    className="flex items-center gap-3 whitespace-nowrap text-[#8a9087] transition-colors duration-200 hover:text-[#181c17]"
                >
                    <Icon size={20} strokeWidth={1.8} aria-hidden />
                    <span className="text-[clamp(1.05rem,1.6vw,1.375rem)] font-medium tracking-[-0.01em]">{label}</span>
                </li>
            ))}
        </ul>
    );
}

export default function FeatureMarquee() {
    return (
        <section aria-label="What Zana includes" className="px-3 py-14 sm:px-5 sm:py-20">
            <style>{css}</style>

            <p className="mb-10 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-[#5f655e]">
                Everything in one workspace
            </p>

            <div className="zana-marquee overflow-hidden">
                <div className="zana-marquee-track flex w-max">
                    {Array.from({ length: COPIES }, (_, i) => (
                        <Copy key={i} extra={i > 0} />
                    ))}
                </div>
            </div>
        </section>
    );
}