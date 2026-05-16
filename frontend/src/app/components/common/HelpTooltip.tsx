import React, { useState, useRef, useEffect } from "react";
import { HelpCircle, X } from "lucide-react";

// HelpTooltip component - Updated to show tooltip below the button
interface HelpTooltipProps {
  title: string;
  content: string;
}

export function HelpTooltip({ title, content }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block ml-2" ref={tooltipRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all focus:outline-none"
        title="Hướng dẫn sử dụng"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-3 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ 
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.75rem'
          }}
        >
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              {title}
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="text-sm text-slate-700 leading-relaxed space-y-2">
              {content.split('\n').map((line, index) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return <div key={index} className="h-2" />;
                
                // Check if line starts with bullet point
                if (trimmedLine.startsWith('•')) {
                  return (
                    <div key={index} className="flex gap-2 items-start">
                      <span className="text-indigo-600 font-bold mt-0.5">•</span>
                      <span className="flex-1">{trimmedLine.substring(1).trim()}</span>
                    </div>
                  );
                }
                
                return <p key={index}>{trimmedLine}</p>;
              })}
            </div>
          </div>
          <div 
            className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45"
            style={{
              position: 'absolute',
              top: '-0.5rem',
              right: '1rem'
            }}
          ></div>
        </div>
      )}
    </div>
  );
}
