/**
 * @author Shiva Nagendra Babu Kore
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, Calendar } from 'lucide-react';
import { Calendar as CalendarComponent } from './ui/calendar';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  minDate?: Date;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDisplayValue = () => {
    if (!value) return placeholder;
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (value.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (value.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return value.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: value.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1 px-1.5 h-5 rounded text-xs font-medium bg-blue-50 text-vscode-link border border-blue-200 cursor-pointer hover:bg-blue-100 transition-all duration-200"
      >
        <Calendar className="w-3 h-3" />
        <span>{formatDisplayValue()}</span>
      </button>
      
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 bg-white border border-vscode-border shadow-xl rounded z-[9999] p-3 overflow-hidden"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: '280px'
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <CalendarComponent
            mode="single"
            selected={value}
            captionLayout="dropdown"
            onSelect={(date) => {
              onChange(date);
              setIsOpen(false);
            }}
            disabled={(date) => minDate ? date < minDate : date < new Date(new Date().setHours(0, 0, 0, 0))}
            className="rounded-md border-0 [--cell-size:1.4rem] text-sm w-fit"
          />
        </div>
      )}
    </div>
  );
};

