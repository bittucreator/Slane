/**
 * @author Shiva Nagendra Babu Kore
 */

import React, { useState, useEffect } from 'react';
import { X, Mail, MessageCircle, Book, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Add Esc key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const supportOptions = [
    {
      title: 'Email Support',
      description: 'Get help via email',
      icon: Mail,
      action: () => window.open('mailto:info@slane.app?subject=Support Request'),
    },
    {
      title: 'Help Center',
      description: 'Browse our documentation',
      icon: Book,
      action: () => window.open('https://help.slane.app', '_blank'),
    },
    {
      title: 'Feature Request',
      description: 'Suggest new features',
      icon: MessageCircle,
      action: () => window.open('mailto:feedback@slane.app?subject=Feature Request'),
    },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ease-out ${
        isVisible ? 'bg-black/50' : 'bg-black/0'
      } flex items-center justify-center p-4 sm:block sm:p-0`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className={`bg-white text-vscode-text w-full max-w-[400px] sm:w-[400px] max-h-[600px] flex flex-col border border-vscode-border rounded transition-all duration-300 ease-out transform sm:fixed sm:bottom-20 sm:left-20 ${
          isVisible
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-vscode-border">
          <h1 className="text-lg font-semibold text-vscode-text">Help & Support</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-4 right-4 text-vscode-text hover:text-white h-8 w-8 transition-colors hover:bg-vscode-sidebar rounded"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <p className="text-sm text-vscode-text-muted mb-6">
            Need help with Slane? Choose one of the options below to get assistance.
          </p>

          <div className="space-y-3">
            {supportOptions.map((option, index) => (
              <button
                key={index}
                onClick={option.action}
                className="w-full flex items-center justify-between p-4 border border-vscode-border rounded hover:bg-vscode-sidebar hover:border-[#505050] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-vscode-sidebar rounded flex items-center justify-center group-hover:bg-vscode-sidebar transition-colors">
                    <option.icon className="w-5 h-5 text-vscode-text" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-vscode-text">
                      {option.title}
                    </h3>
                    <p className="text-xs text-vscode-text-muted">
                      {option.description}
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-vscode-text-muted group-hover:text-vscode-text transition-colors" />
              </button>
            ))}
          </div>

          {/* App Info */}
          <div className="mt-6 pt-6 border-t border-vscode-border">
            <h3 className="text-sm font-medium text-vscode-text mb-3">App Information</h3>
            <div className="space-y-2 text-xs text-vscode-text-muted">
              <div className="flex justify-between">
                <span>Version</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
