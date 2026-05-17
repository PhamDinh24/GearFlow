import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { AlertTriangle, Info, Trash2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = 'warning',
  isLoading = false,
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (type) {
      case 'danger': return <Trash2 className="w-6 h-6 text-red-600" />;
      case 'info': return <Info className="w-6 h-6 text-blue-600" />;
      default: return <AlertTriangle className="w-6 h-6 text-orange-600" />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'danger': return "bg-red-600 hover:bg-red-700 text-white rounded-xl";
      case 'info': return "bg-blue-600 hover:bg-blue-700 text-white rounded-xl";
      default: return "bg-orange-600 hover:bg-orange-700 text-white rounded-xl";
    }
  };

  const getIconContainerClass = () => {
    switch (type) {
      case 'danger': return "bg-red-100";
      case 'info': return "bg-blue-100";
      default: return "bg-orange-100";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getIconContainerClass()}`}>
              {getIcon()}
            </div>
            <div className="flex-1">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 leading-tight">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-slate-500 mt-2 text-sm leading-relaxed">
                  {description}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>
        
        <DialogFooter className="bg-slate-50 p-4 flex flex-col sm:flex-row gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-xl text-slate-600 hover:bg-slate-200 order-2 sm:order-1"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
            }}
            className={`flex-1 order-1 sm:order-2 ${getButtonClass()}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang xử lý...</span>
              </div>
            ) : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
