interface FormFieldProps {
    id: string;
    label: string;
    value: string | number;
    onChange: (value: string | number) => void;
    disabled?: boolean;
    tabIndex?: number;
    placeholder?: string;
    hint?: string;
    required?: boolean;
    type?: 'text' | 'number' | 'textarea' | 'select';
    rows?: number;
    min?: string | number;
    max?: string | number;
    step?: string | number;
    options?: { value: string; label: string }[];
    className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
    id,
    label,
    value,
    onChange,
    disabled = false,
    tabIndex,
    placeholder,
    hint,
    required = false,
    type = 'text',
    rows = 3,
    min,
    max,
    step,
    options = [],
    className = '',
}) => {
    const baseInputClasses =
        'w-full px-3 py-2 text-sm border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        if (type === 'number') {
            const numValue =
                type === 'number'
                    ? parseFloat(e.target.value) || 0
                    : e.target.value;
            onChange(numValue);
        } else {
            onChange(e.target.value);
        }
    };

    const renderInput = () => {
        switch (type) {
            case 'textarea':
                return (
                    <textarea
                        id={id}
                        value={value}
                        onChange={handleChange}
                        disabled={disabled}
                        rows={rows}
                        tabIndex={tabIndex}
                        className={`${baseInputClasses} resize-none ${className}`}
                        placeholder={placeholder}
                    />
                );
            case 'select':
                return (
                    <select
                        id={id}
                        value={value}
                        onChange={handleChange}
                        disabled={disabled}
                        tabIndex={tabIndex}
                        className={`${baseInputClasses} ${className}`}
                    >
                        {options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            case 'number':
                return (
                    <input
                        id={id}
                        type="number"
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        onChange={handleChange}
                        disabled={disabled}
                        tabIndex={tabIndex}
                        className={`${baseInputClasses} ${className}`}
                        placeholder={placeholder}
                    />
                );
            default:
                return (
                    <input
                        id={id}
                        type="text"
                        value={value}
                        onChange={handleChange}
                        disabled={disabled}
                        tabIndex={tabIndex}
                        className={`${baseInputClasses} ${className}`}
                        placeholder={placeholder}
                    />
                );
        }
    };

    return (
        <div className={type === 'textarea' && rows > 3 ? 'mb-3' : 'mb-3'}>
            <label
                htmlFor={id}
                className="block text-xs font-medium text-gray-300 mb-1"
            >
                {label}
                {required && <span className="text-purple-400"> *</span>}
                {hint && (
                    <span className="text-gray-500 text-xs ml-1">{hint}</span>
                )}
            </label>
            {renderInput()}
        </div>
    );
};
