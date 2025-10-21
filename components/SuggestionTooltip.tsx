'use client';

import { useState, useRef, useEffect } from 'react';

interface SuggestionTooltipProps {
    suggestions: string[];
    currentValue: string;
    placeholder: string;
    example: string;
    onSelect: (value: string) => void;
    isVisible: boolean;
    onClose: () => void;
    fieldColor: string;
    fieldLabel: string;
}

export const SuggestionTooltip: React.FC<SuggestionTooltipProps> = ({
    suggestions,
    currentValue,
    placeholder,
    example,
    onSelect,
    isVisible,
    onClose,
    fieldColor,
    fieldLabel,
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isVisible) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isVisible, onClose]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isVisible) return;

            switch (event.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    setHoveredIndex(prev =>
                        prev < suggestions.length - 1 ? prev + 1 : 0
                    );
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    setHoveredIndex(prev =>
                        prev > 0 ? prev - 1 : suggestions.length - 1
                    );
                    break;
                case 'Enter':
                    event.preventDefault();
                    if (hoveredIndex >= 0 && hoveredIndex < suggestions.length) {
                        onSelect(suggestions[hoveredIndex]);
                        onClose();
                    }
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isVisible, hoveredIndex, suggestions, onSelect, onClose]);

    if (!isVisible || suggestions.length === 0) return null;

    const handleSuggestionClick = (suggestion: string) => {
        onSelect(suggestion);
        onClose();
    };

    return (
        <div
            ref={tooltipRef}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 animate-in fade-in-0 duration-200"
            onClick={onClose}
        >
            <div
                className="bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700 w-full max-w-md overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-white capitalize text-sm">{fieldLabel}</h4>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Current Value */}
                    {currentValue && (
                        <div className="mb-4">
                            <div className="text-xs text-gray-400 mb-2">Actuel</div>
                            <button
                                onClick={() => handleSuggestionClick(currentValue)}
                                className="w-full text-left p-3 rounded-lg bg-gray-800 border border-gray-600 hover:bg-gray-700 transition-all duration-200"
                            >
                                <div className="text-white text-sm">{currentValue}</div>
                            </button>
                        </div>
                    )}

                    {/* Suggestions */}
                    <div className="space-y-2">
                        {suggestions.length > 0 && (
                            <div className="text-xs text-gray-400 mb-3">Suggestions IA</div>
                        )}
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(-1)}
                                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${hoveredIndex === index || (hoveredIndex === -1 && index === 0)
                                    ? 'bg-blue-500 border border-blue-400 text-white'
                                    : 'bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-200'
                                    }`}
                            >
                                <div className="text-sm leading-relaxed">{suggestion}</div>
                            </button>
                        ))}
                    </div>

                    {/* Example (fallback if no suggestions) */}
                    {suggestions.length === 0 && (
                        <div>
                            <div className="text-xs text-gray-400 mb-3">Exemple</div>
                            <div className="p-3 rounded-lg bg-gray-800 border border-gray-700">
                                <div className="text-gray-300 text-sm italic">&quot;{example}&quot;</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-gray-800 border-t border-gray-700">
                    <div className="text-xs text-gray-500 text-center">
                        ↑↓ naviguer • ↵ sélectionner • Échap fermer
                    </div>
                </div>
            </div>
        </div>
    );
};