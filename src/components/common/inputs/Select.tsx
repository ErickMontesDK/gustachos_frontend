import React from 'react';

interface Option {
    id: string | number;
    name: string;
}

interface SelectProps {
    label?: string;
    name: string;
    id?: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
}

const Select: React.FC<SelectProps> = ({
    label,
    name,
    id,
    value,
    onChange,
    options,
    placeholder = "All",
    className = "form-select"
}) => {
    return (
        <div className="select-container">
            {label && <label htmlFor={id || name} className="form-label">{label}</label>}
            <select
                name={name}
                id={id || name}
                className={className}
                onChange={onChange}
                value={value}
            >
                {placeholder !== undefined && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Select;
