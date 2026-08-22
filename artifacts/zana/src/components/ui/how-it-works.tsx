type Step = {
    number: string;
    title: string;
    description: string;
    media: { type: 'image' | 'video'; path: string; label: string };
};

const steps: Step[] = [
    {
        number: '01',
        title: 'Create a project',
        description: 'Give the work a clear home. Name it, describe what done looks like, and you\'re ready to go — no setup wizard, no clutter.',
        media: { type: 'image', path: '/how-it-works/create-project.png', label: 'Screenshot: "New project" modal' },
    },
    {
        number: '02',
        title: 'Organize with a Kanban board',
        description: 'Every project gets a focused three-column board — Not started, In progress, Complete. Drag a card across and it just moves. No configuration.',
        media: { type: 'video', path: '/how-it-works/kanban-drag.mp4', label: 'Video: dragging a task across columns' },
    },
    {
        number: '03',
        title: 'Invite your team',
        description: 'Bring people in by email. They get real access to just that project — nothing else in your workspace is visible to them.',
        media: { type: 'image', path: '/how-it-works/invite-members.png', label: 'Screenshot: "Project members" modal' },
    },
    {
        number: '04',
        title: 'Track progress at a glance',
        description: 'Your overview shows live stats and recent activity across every project — so you always know what moved, and what\'s next.',
        media: { type: 'image', path: '/how-it-works/overview-dashboard.png', label: 'Screenshot: Dashboard overview' },
    },
];

function MediaPlaceholder({ media }: { media: Step['media'] }) {
    return (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted/50">
            {media.type === 'video' ? (
                <video src={media.path} autoPlay muted loop playsInline className="h-full w-full object-cover" />
            ) : (
                <img src={media.path} alt={media.label} className="h-full w-full object-cover" />
            )}
        </div>
    );
}

export function HowItWorks() {
    return (
        <section className="border-t border-border px-6 py-16 sm:px-10 sm:py-24">
            <div className="mb-14 max-w-2xl">
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">How it works</p>
                <h2 className="text-4xl font-extrabold leading-[0.95] tracking-tighter sm:text-5xl">
                    From idea to shipped, in four quiet steps.
                </h2>
            </div>

            <div className="grid gap-16 sm:gap-24">
                {steps.map((step, i) => (
                    <div
                        key={step.number}
                        className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16 ${i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}
                    >
                        <div>
                            <span className="font-mono text-sm text-muted-foreground">{step.number}</span>
                            <h3 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{step.title}</h3>
                            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                        </div>
                        <MediaPlaceholder media={step.media} />
                    </div>
                ))}
            </div>
        </section>
    );
}