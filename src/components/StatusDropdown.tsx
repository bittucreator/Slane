/**
 * @author Shiva Nagendra Babu Kore
 */

import React, { useState } from "react";
import { CircleDashed, Contrast, CircleCheck, CircleX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export type TaskStatus = "todo" | "in_progress" | "completed" | "canceled";

interface StatusDropdownProps {
  status: TaskStatus;
  onChange: (status: TaskStatus) => void;
  disabled?: boolean;
  showText?: boolean;
}

interface StatusConfig {
  key: TaskStatus;
  label: string;
  icon: React.ReactNode;
  className: string;
  iconColor: string;
}

const statusConfigs: StatusConfig[] = [
  {
    key: "todo",
    label: "Todo",
    icon: <CircleDashed className="w-3.5 h-3.5" />,
    className: "text-vscode-text",
    iconColor: "text-vscode-text-muted",
  },
  {
    key: "in_progress",
    label: "In Progress",
    icon: <Contrast className="w-3.5 h-3.5" />,
    className: "text-vscode-info",
    iconColor: "text-vscode-info",
  },
  {
    key: "completed",
    label: "Completed",
    icon: <CircleCheck className="w-3.5 h-3.5" />,
    className: "text-vscode-success",
    iconColor: "text-vscode-success",
  },
  {
    key: "canceled",
    label: "Canceled",
    icon: <CircleX className="w-3.5 h-3.5" />,
    className: "text-vscode-error",
    iconColor: "text-vscode-error",
  },
];

export const StatusDropdown: React.FC<StatusDropdownProps> = ({
  status,
  onChange,
  disabled = false,
  showText = true, // Default to showing text (for modals)
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentConfig =
    statusConfigs.find((config) => config.key === status) || statusConfigs[0];

  const handleStatusChange = (newStatus: TaskStatus) => {
    onChange(newStatus);
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
              : `justify-center w-6 h-6 rounded ${
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
        className="w-44 bg-white border border-vscode-border rounded shadow-lg py-1"
        onClick={(e) => e.stopPropagation()}
      >
        {statusConfigs.map((config) => (
          <DropdownMenuItem
            key={config.key}
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(config.key);
            }}
            className={`flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-vscode-active focus:bg-vscode-active ${
              config.key === status ? "bg-vscode-active" : ""
            }`}
          >
            <span className={config.iconColor}>{config.icon}</span>
            <span className={config.className}>{config.label}</span>
            {config.key === status && (
              <svg
                className="w-3.5 h-3.5 ml-auto text-vscode-text"
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

export default StatusDropdown;
