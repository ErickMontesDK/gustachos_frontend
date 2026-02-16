import React from 'react';

interface SearchbarProps {
    name: string;
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    label: string;
    className?: string;
}

export default function Searchbar({
    name,
    id,
    value,
    onChange,
    placeholder,
    label,
    className = "form-control" }: SearchbarProps) {
    return (
        <div className="searchbar-container">
            {label && <label htmlFor={id || name} className="form-label">{label}</label>}
            <input
                type="text"
                name={name}
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={className}
            />
        </div>
    );
}
