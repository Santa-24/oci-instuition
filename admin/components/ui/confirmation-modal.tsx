'use client';

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from './button';
import { Modal } from './modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  entityName?: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  entityName,
  confirmLabel = 'Confirm Action',
  isDestructive = true,
  isLoading = false,
}: ConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4 pt-1">
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold">{message}</p>
            {entityName && (
              <p className="font-mono bg-rose-500/15 px-2 py-0.5 rounded inline-block text-[11px] font-bold">
                {entityName}
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          This operation will immediately synchronize with the live Supabase PostgreSQL database. This action cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={isDestructive ? 'destructive' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            leftIcon={isDestructive ? <Trash2 className="h-3.5 w-3.5" /> : undefined}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
