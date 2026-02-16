import React from 'react';
import { DateTime } from 'luxon';
import { TIMEZONE } from '../../../config';

interface DatePickerProps {
    name: string;
    id?: string;
    value: string; // Recibe el valor en formato ISO
    onChange: (isoValue: string) => void; // Solo devuelve el ISO
    label?: string;
    className?: string;
    mode?: 'start' | 'end';
}

const DatePicker: React.FC<DatePickerProps> = ({
    name,
    id,
    value,
    onChange,
    label,
    className = "form-control",
    mode = 'start'
}) => {
    // Convertimos el ISO que llega por prop a formato YYYY-MM-DD para el input browser
    const rawValue = value ? DateTime.fromISO(value, { zone: TIMEZONE }).toISODate() : "";

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedValue = e.target.value;
        if (!selectedValue) {
            onChange("");
            return;
        }

        let dateTranslated = DateTime.fromISO(selectedValue, { zone: TIMEZONE });
        if (mode === 'start') {
            dateTranslated = dateTranslated.startOf('day');
        } else {
            dateTranslated = dateTranslated.endOf('day');
        }

        onChange(dateTranslated.toISO() || "");
    };

    return (
        <div className="datepicker-container">
            {label && <label htmlFor={id || name} className="form-label">{label}</label>}
            <input
                type="date"
                name={name}
                id={id || name}
                className={className}
                onChange={handleDateChange}
                value={rawValue || ""}
            />
        </div>
    );
};

export default DatePicker;
