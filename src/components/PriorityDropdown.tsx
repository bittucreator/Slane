/**
 * @author Shiva Nagendra Babu Kore
 */

import React, { useState } from "react";
import { Signal, SignalHigh, SignalMedium } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export type TaskPriority = "high" | "medium" | "low";

interface PriorityDropdownProps {
  priority: TaskPriority;
  onChange: (priority: TaskPriority) => void;
  disabled?: boolean;
  showText?: boolean;
}

interface PriorityConfig {
  key: TaskPriority;
  label: string;
  icon: React.ReactNode;
  className: string;
  iconColor: string;
  bgColor: string;
}

const priorityConfigs: PriorityConfig[] = [
  {
    key: "high",
    label: "High",
    icon: <Signal className="w-4 h-4" />,
    className: "text-vscode-error",
    iconColor: "text-vscode-error",
    bgColor: "bg-red-50",
  },
  {
    key: "medium",
    label: "Medium",
    icon: <SignalHigh className="w-4 h-4" />,
    className: "text-vscode-warning",
    iconColor: "text-vscode-warning",
    bgColor: "bg-yellow-50",
  },
  {
    key: "low",
    label: "Low",
    icon: <SignalMedium className="w-4 h-4" />,
    className: "text-vscode-text-muted",
    iconColor: "text-vscode-text-muted",
    bgColor: "bg-gray-50",
  },
];

export const PriorityDropdown: React.FC<PriorityDropdownProps> = ({
  priority,
  onChange,
  disabled = false,
  showText = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentConfig =
    priorityConfigs.find((config) => config.key === priority) || priorityConfigs[2];

  const handlePriorityChange = (newPriority: TaskPriority) => {
    onChange(newPriority);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center transition-all duration-200 focus:outline-none ${
            showText 
              ? `gap-1 px-2 py-0.5 rounded text-xs font-normal border ${
                  disabled 
                    ? "opacity-50 cursor-not-allowed" 
                    : "cursor-pointer hover:bg-vscode-sidebar"
                } bg-vscode-sidebar border-vscode-border`
              : `justify-center w-5 h-5 rounded ${
                  disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`
          }`}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
              setIsOpen(!isOpen);
            }
          }}
        >
          <span className={currentConfig.iconColor}>{currentConfig.icon}</span>
          {showText && <span className={`capitalize ${currentConfig.className}`}>{currentConfig.label}</span>}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-36 bg-white border border-vscode-border rounded shadow-lg py-1"
        onClick={(e) => e.stopPropagation()}
      >
        {priorityConfigs.map((config) => (
          <DropdownMenuItem
            key={config.key}
            onClick={(e) => {
              e.stopPropagation();
              handlePriorityChange(config.key);
            }}
            className={`flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-vscode-hover focus:bg-vscode-hover ${
              config.key === priority ? "bg-vscode-hover" : ""
            }`}
          >
            <span className={config.iconColor}>{config.icon}</span>
            <span className={config.className}>{config.label}</span>
            {config.key === priority && (
              <svg
                className="w-4 h-4 ml-auto text-vscode-text"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PriorityDropdown;
