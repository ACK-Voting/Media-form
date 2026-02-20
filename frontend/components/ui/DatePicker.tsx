'use client';

import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  label?: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showTimeSelect?: boolean;
  dateFormat?: string;
  className?: string;
  disabled?: boolean;
}

export default function DatePicker({
  label,
  selected,
  onChange,
  placeholder = 'Select date...',
  required = false,
  minDate,
  maxDate,
  showTimeSelect = false,
  dateFormat = 'MMMM d, yyyy',
  className = '',
  disabled = false,
}: DatePickerProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <ReactDatePicker
          selected={selected}
          onChange={onChange}
          placeholderText={placeholder}
          minDate={minDate}
          maxDate={maxDate}
          showTimeSelect={showTimeSelect}
          dateFormat={dateFormat}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none shadow-sm hover:border-gray-400 cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 placeholder:text-gray-500"
          wrapperClassName="w-full"
          calendarClassName="custom-datepicker"
        />
      </div>
    </div>
  );
}
