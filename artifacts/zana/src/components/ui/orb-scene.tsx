import { useEffect, useRef, useState } from 'react';

// Replaces the earlier Three.js/WebGL version, which rendered a correctly
// sized <canvas> in the DOM but never actually drew anything on some setups
// (silent WebGL failure — no console error, so nothing to fix there).
// Pure SVG + CSS animation always renders, needs no GPU context, and gets
// us the same "rotating wireframe orb" effect with zero runtime risk.

function useIsDark() {
    const [isDark, setIsDark] = useState(
        () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
    );

    useEffect(() => {
        const el = document.documentElement;
        const observer = new MutationObserver(() => setIsDark(el.classList.contains('dark')));
        observer.observe(el, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    return isDark;
}

export function OrbScene({ className }: { className?: string }) {
    const isDark = useIsDark();
    const color = isDark ? '#f5f5f5' : '#111111';
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [tiltDeg, setTiltDeg] = useState(-8);

    // Mouse parallax on the whole wrapper.
    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;
        const onMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 16;
            const y = (e.clientY / window.innerHeight - 0.5) * 16;
            el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        };
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    // Scroll-linked tilt of the whole sphere (separate from the constant
    // auto-rotation, which is handled entirely by CSS keyframes below).
    useEffect(() => {
        const onScroll = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const fraction = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
            setTiltDeg(-8 + fraction * 40);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div
            ref={wrapperRef}
            className={className}
            style={{
                width: '100%',
                height: '100%',
                transition: 'transform 0.15s ease-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                perspective: 800,
            }}
        >
            <style>{`
        @keyframes zana-orb-spin-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes zana-orb-spin-ccw { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes zana-orb-pulse { 0%, 100% { opacity: 0.55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.15); } }
      `}</style>
            <div
                style={{
                    width: '78%',
                    height: '78%',
                    position: 'relative',
                    transform: `rotateX(${tiltDeg}deg)`,
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.3s ease-out',
                }}
            >
                <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    <g style={{ transformOrigin: '100px 100px', animation: 'zana-orb-spin-cw 18s linear infinite' }}>
                        <ellipse cx="100" cy="100" rx="90" ry="90" fill="none" stroke={color} strokeWidth="1" opacity={0.35} />
                        <ellipse cx="100" cy="100" rx="90" ry="34" fill="none" stroke={color} strokeWidth="1" opacity={0.45} />
                        <ellipse cx="100" cy="100" rx="34" ry="90" fill="none" stroke={color} strokeWidth="1" opacity={0.45} />
                    </g>
                    <g style={{ transformOrigin: '100px 100px', animation: 'zana-orb-spin-ccw 24s linear infinite' }}>
                        <ellipse cx="100" cy="100" rx="65" ry="65" fill="none" stroke={color} strokeWidth="1" opacity={0.3} />
                        <ellipse cx="100" cy="100" rx="65" ry="22" fill="none" stroke={color} strokeWidth="1" opacity={0.4} />
                        <ellipse cx="100" cy="100" rx="22" ry="65" fill="none" stroke={color} strokeWidth="1" opacity={0.4} />
                    </g>
                    <g style={{ transformOrigin: '100px 100px', animation: 'zana-orb-spin-cw 30s linear infinite' }}>
                        <ellipse cx="100" cy="100" rx="42" ry="42" fill="none" stroke={color} strokeWidth="1" opacity={0.25} />
                    </g>
                    <circle
                        cx="100"
                        cy="100"
                        r="7"
                        fill={color}
                        style={{ animation: 'zana-orb-pulse 3s ease-in-out infinite', transformOrigin: '100px 100px' }}
                    />
                </svg>
            </div>
        </div>
    );
}