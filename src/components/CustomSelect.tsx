import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus } from 'lucide-react';

export interface CustomSelectOption {
    value: string;
    label: string;
    emoji?: string;
    /** Optional Tailwind class for the badge colour */
    badgeClass?: string;
}

interface CustomSelectProps {
    options: CustomSelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    id?: string;
    required?: boolean;
    disabled?: boolean;
    error?: boolean;
    /** Extra class applied to the trigger button */
    className?: string;
    /** If provided, shows an "Add New" footer button in the dropdown */
    onAddNew?: () => void;
    addNewLabel?: string;
}

/**
 * Reusable custom dropdown replacing native <select>.
 * Works identically to a controlled select — value + onChange.
 * Supports an optional "Add New" footer via onAddNew prop.
 */
const CustomSelect: React.FC<CustomSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select an option…',
    id,
    required,
    disabled,
    error,
    className = '',
    onAddNew,
    addNewLabel = 'Add New',
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selected = options.find(o => o.value === value) ?? null;

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const borderClass = error
        ? 'border-red-400 focus:ring-red-400/20'
        : open
            ? 'border-primary-500 ring-2 ring-primary-500/20 bg-white'
            : 'border-gray-200 hover:border-gray-300 bg-gray-50';

    return (
        <div ref={ref} className={`relative ${className}`} id={id}>
            {/* Trigger */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setOpen(o => !o)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 border rounded-xl text-sm transition-all ${borderClass} ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}`}
            >
                {selected ? (
                    <span className="flex items-center gap-2 min-w-0">
                        {selected.emoji && (
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-base ${selected.badgeClass ?? 'bg-primary-50'}`}>
                                {selected.emoji}
                            </span>
                        )}
                        <span className="font-medium text-gray-800 truncate">{selected.label}</span>
                    </span>
                ) : (
                    <span className="text-gray-400">{placeholder}</span>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {/* Hidden input for native form validation */}
            <input type="hidden" value={value} required={required} />

            {/* Dropdown panel */}
            {open && (
                <div className="absolute z-30 left-0 right-0 top-[calc(100%+6px)] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-1.5 max-h-60 overflow-y-auto custom-scrollbar">
                        {options.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-3">No options available</p>
                        ) : (
                            options.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => { onChange(option.value); setOpen(false); }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-all ${value === option.value
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {option.emoji && (
                                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${option.badgeClass ?? 'bg-gray-50'}`}>
                                            {option.emoji}
                                        </span>
                                    )}
                                    <span className="font-medium flex-1 truncate">{option.label}</span>
                                    {value === option.value && (
                                        <Check className="w-4 h-4 text-primary-500 flex-shrink-0" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                    {/* Add New footer */}
                    {onAddNew && (
                        <button
                            type="button"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => { onAddNew(); setOpen(false); }}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 border-t border-gray-100 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            {addNewLabel}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
