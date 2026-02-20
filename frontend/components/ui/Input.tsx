import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    as?: 'input' | 'textarea' | 'select';
    options?: { value: string; label: string }[];
    rows?: number;
}

const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, InputProps>(
    ({ label, error, helperText, as = 'input', options, className = '', ...props }, ref) => {
        const baseStyles = 'w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white text-gray-900 placeholder:text-gray-500';
        const errorStyles = error ? 'border-red-500' : 'border-gray-400 hover:border-gray-500';

        const renderInput = () => {
            if (as === 'textarea') {
                return (
                    <textarea
                        ref={ref as React.Ref<HTMLTextAreaElement>}
                        className={`${baseStyles} ${errorStyles} ${className}`}
                        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                    />
                );
            }

            if (as === 'select') {
                return (
                    <div className="relative">
                        <select
                            ref={ref as React.Ref<HTMLSelectElement>}
                            className={`${baseStyles} ${errorStyles} appearance-none pr-10 ${className}`}
                            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
                        >
                            {options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                );
            }

            return (
                <input
                    ref={ref as React.Ref<HTMLInputElement>}
                    className={`${baseStyles} ${errorStyles} ${className}`}
                    {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                />
            );
        };

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                {renderInput()}
                {error && <p className="mt-1 text-sm text-red-600 font-medium">{error}</p>}
                {helperText && !error && <p className="mt-1 text-sm text-gray-600">{helperText}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
