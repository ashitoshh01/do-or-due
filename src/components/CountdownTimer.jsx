import React from 'react';

// Flip Clock Card Component (Rolling Effect)
const FlipCard = ({ value, label }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <div className="flip-card">
            {/* key={value} forces React to unmount/remount, triggering the @keyframe animation */}
            <div key={value} className="flip-card-inner">
                {value}
            </div>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 600, color: 'hsl(var(--color-text-secondary))', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
        </span>
    </div>
);

// Main Countdown Renderer
const CountdownTimer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '12px',
                background: '#FEF2F2',
                color: '#EF4444',
                borderRadius: '8px',
                border: '1px solid #FCA5A5',
                fontWeight: 700
            }}>
                Time's Up! Task Failed.
            </div>
        );
    }

    // Format Number (01, 02, etc.)
    const fmt = (n) => n.toString().padStart(2, '0');

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 0' }}>
            <FlipCard value={fmt(days)} label="Days" />
            <FlipCard value={fmt(hours)} label="Hours" />
            <FlipCard value={fmt(minutes)} label="Minutes" />
            <FlipCard value={fmt(seconds)} label="Seconds" />
        </div>
    );
};

export default CountdownTimer;
