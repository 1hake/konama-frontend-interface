'use client';

import { useState, useRef, useEffect } from 'react';
import { SuggestionTooltip } from './SuggestionTooltip';

interface InlineField {
    name: string;
    label: string;
    placeholder: string;
    example: string;
    color: string;
}

interface InlineTokenProps {
    field: InlineField;
    value: string;
    onChange: (value: string) => void;
    isGenerating: boolean;
    fieldIndex: number;
    onNavigate: (direction: 'prev' | 'next') => void;
    suggestions?: string[];
    hasSuggestions?: boolean;
}

export const InlineToken: React.FC<InlineTokenProps> = ({
    field,
    value,
    onChange,
    isGenerating,
    fieldIndex,
    onNavigate,
    suggestions = [],
    hasSuggestions = false
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleClick = () => {
        if (!isGenerating) {
            if (hasSuggestions && suggestions.length > 0) {
                setShowSuggestions(true);
                setShowTooltip(false);
            } else {
                setIsEditing(true);
                setShowTooltip(false);
            }
        }
    };

    const handleEdit = () => {
        if (!isGenerating) {
            setIsEditing(true);
            setShowSuggestions(false);
            setShowTooltip(false);
        }
    };

    const handleBlur = () => {
        setTimeout(() => {
            setIsEditing(false);
        }, 100);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            setIsEditing(false);
            if (!e.shiftKey) {
                onNavigate('next');
            } else {
                onNavigate('prev');
            }
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            buttonRef.current?.focus();
        } else if (e.key === 'ArrowRight' && inputRef.current) {
            const input = inputRef.current;
            if (input.selectionStart === input.value.length) {
                e.preventDefault();
                setIsEditing(false);
                onNavigate('next');
            }
        } else if (e.key === 'ArrowLeft' && inputRef.current) {
            const input = inputRef.current;
            if (input.selectionStart === 0) {
                e.preventDefault();
                setIsEditing(false);
                onNavigate('prev');
            }
        }
    };

    const handleSuggestionSelect = (selectedValue: string) => {
        onChange(selectedValue);
        setShowSuggestions(false);
    };

    const displayValue = value || field.placeholder;
    const isEmpty = !value;
    const hasAISuggestions = hasSuggestions && suggestions.length > 0;

    if (isEditing) {
        return (
            <span className="inline-flex items-center">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={field.placeholder}
                    disabled={isGenerating}
                    className={`
                        inline-block px-4 py-2 rounded-full border
                        ${field.color}
                        glass-light text-white placeholder-gray-400 font-light
                        focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50
                        min-w-[120px] max-w-[400px] transition-all
                    `}
                    style={{ width: `${Math.max(120, (value || field.placeholder).length * 8 + 32)}px` }}
                />
            </span>
        );
    }

    return (
        <div className="inline-block relative group">
            <button
                ref={buttonRef}
                type="button"
                onClick={handleClick}
                onMouseEnter={() => !hasAISuggestions && setShowTooltip(true)}
                onMouseLeave={() => !hasAISuggestions && setShowTooltip(false)}
                disabled={isGenerating}
                data-field-index={fieldIndex}
                className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300
                    ${field.color}
                    ${isEmpty ? 'border-dashed opacity-75' : 'border-solid'}
                    ${hasAISuggestions ? 'ring-2 ring-blue-400/30 border-blue-400/60' : ''}
                    hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]
                    cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50
                `}
            >
                <span className={`font-light text-sm ${isEmpty ? 'italic opacity-70' : ''}`}>
                    {displayValue}
                </span>

                {hasAISuggestions && (
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                    </div>
                )}

                {!isEmpty && !hasAISuggestions && (
                    <svg className="w-3.5 h-3.5 opacity-40 group-hover:opacity-60 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                )}
            </button>

            {/* AI Suggestions Tooltip */}
            {hasAISuggestions && (
                <SuggestionTooltip
                    suggestions={suggestions}
                    currentValue={value}
                    placeholder={field.placeholder}
                    example={field.example}
                    onSelect={handleSuggestionSelect}
                    isVisible={showSuggestions}
                    onClose={() => setShowSuggestions(false)}
                    fieldColor={field.color}
                    fieldLabel={field.label}
                />
            )}

            {/* Simple Example Tooltip */}
            {!hasAISuggestions && showTooltip && !isEditing && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-30 animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-200">
                    <div className="glass-light text-white px-5 py-3 rounded-2xl shadow-xl border border-white/10 min-w-[320px] max-w-md">
                        <div className="text-xs font-medium text-gray-400 mb-2">
                            Exemple:
                        </div>
                        <div className="text-sm italic text-gray-100 leading-relaxed font-light">
                            &quot;{field.example}&quot;
                        </div>
                        {/* Arrow */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2">
                            <div className="border-4 border-transparent border-b-gray-900/95"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Button for AI Suggestions */}
            {hasAISuggestions && (
                <button
                    onClick={handleEdit}
                    className="absolute -top-1 -right-1 w-6 h-6 glass-light hover:bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/20 active:scale-90"
                    title="Modifier manuellement"
                >
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                </button>
            )}
        </div>
    );
};