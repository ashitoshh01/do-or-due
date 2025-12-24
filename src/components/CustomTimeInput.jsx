import React from 'react';

// Custom Time Input Component
const CustomTimeInput = ({ date, value, onChange, customTimeInput }) => {
    // Helper to trigger change
    const handleChange = (type, val) => {
        const currentDate = date || new Date();
        let hours = currentDate.getHours();
        let minutes = currentDate.getMinutes();

        if (type === 'ampm') {
            if (val === 'PM' && hours < 12) hours += 12;
            if (val === 'AM' && hours >= 12) hours -= 12;
        } else if (type === 'hour') {
            const isPM = hours >= 12;
            hours = parseInt(val);
            if (isPM && hours < 12) hours += 12;
            if (!isPM && hours === 12) hours = 0;
        } else if (type === 'minute') {
            minutes = parseInt(val);
        }

        const newDate = new Date(currentDate);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);

        // Format as "HH:mm" (24-hour format) for React-Datepicker to parse
        const timeStr = `${newDate.getHours().toString().padStart(2, '0')}:${newDate.getMinutes().toString().padStart(2, '0')}`;
        onChange(timeStr);
    };

    // Extract current values for dropdowns
    const d = date || new Date();
    let displayHour = d.getHours() % 12;
    if (displayHour === 0) displayHour = 12;
    const displayMinute = d.getMinutes().toString().padStart(2, '0');
    const displayAmPm = d.getHours() >= 12 ? 'PM' : 'AM';

    return (
        <div style={{ display: 'flex', gap: '8px', padding: '8px', background: 'hsl(var(--color-bg-card))', border: '1px solid hsl(var(--color-border))', borderRadius: '8px', marginTop: '8px' }}>
            <select
                value={displayHour}
                onChange={(e) => handleChange('hour', e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid hsl(var(--color-border))', background: 'hsl(var(--color-bg-input))', color: 'hsl(var(--color-text-main))', fontWeight: 'bold' }}
            >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                    <option key={h} value={h}>{h}</option>
                ))}
            </select>
            <span style={{ alignSelf: 'center', fontWeight: 'bold', color: 'hsl(var(--color-text-main))' }}>:</span>
            <select
                value={displayMinute}
                onChange={(e) => handleChange('minute', e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid hsl(var(--color-border))', background: 'hsl(var(--color-bg-input))', color: 'hsl(var(--color-text-main))', fontWeight: 'bold' }}
            >
                {/* 1-Minute Precision: 0 to 59 */}
                {Array.from({ length: 60 }, (_, i) => i).map(m => (
                    <option key={m} value={m.toString().padStart(2, '0')}>{m.toString().padStart(2, '0')}</option>
                ))}
            </select>
            <select
                value={displayAmPm}
                onChange={(e) => handleChange('ampm', e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid hsl(var(--color-border))', background: 'hsl(var(--color-bg-input))', color: 'hsl(var(--color-text-main))', fontWeight: 'bold' }}
            >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
            </select>
        </div>
    );
};

export default CustomTimeInput;
