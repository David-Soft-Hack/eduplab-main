import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, children, actions, className }: DialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
        >
          <div className="absolute inset-0 bg-scrim/40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative w-full max-w-md bg-surface rounded-2xl shadow-elevation-level3 max-h-[85vh] overflow-y-auto',
              className,
            )}
          >
            {title && (
              <div className="px-6 pt-6 pb-2">
                <h2 className="text-title-large text-on-surface">{title}</h2>
              </div>
            )}
            <div className="px-6 py-4 text-body-medium text-on-surface-variant">{children}</div>
            {actions && (
              <div className="flex items-center justify-end gap-2 px-6 pb-4 pt-2">{actions}</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
