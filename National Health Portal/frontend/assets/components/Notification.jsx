import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const Notification = ({ type = 'success', message, onClose, duration = 4000, lang = 'en' }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const config = {
    success: {
      icon: 'fa-circle-check',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-200',
      iconClass: 'text-emerald-500',
      textClass: 'text-emerald-700',
      iconBgClass: 'bg-emerald-100'
    },
    error: {
      icon: 'fa-circle-xmark',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-200',
      iconClass: 'text-rose-500',
      textClass: 'text-rose-700',
      iconBgClass: 'bg-rose-100'
    },
    warning: {
      icon: 'fa-triangle-exclamation',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-200',
      iconClass: 'text-amber-500',
      textClass: 'text-amber-700',
      iconBgClass: 'bg-amber-100'
    },
    info: {
      icon: 'fa-circle-info',
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-200',
      iconClass: 'text-blue-500',
      textClass: 'text-blue-700',
      iconBgClass: 'bg-blue-100'
    }
  };

  const currentConfig = config[type] || config.info;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`${currentConfig.bgClass} bg-opacity-80 backdrop-blur-md ${currentConfig.borderClass} border rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 flex items-start gap-4 max-w-md w-full relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className={`${currentConfig.iconBgClass} rounded-2xl p-3 shrink-0 shadow-sm relative z-10`}>
            <i className={`fa-solid ${currentConfig.icon} ${currentConfig.iconClass} text-xl`}></i>
          </div>
          <div className="flex-1 min-w-0 mt-0.5 relative z-10">
            <p className={`${currentConfig.textClass} font-bold text-[13px] leading-relaxed tracking-wide`}>
              {message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`${currentConfig.iconClass} hover:bg-black/5 hover:text-black rounded-lg p-2 transition-all shrink-0 mt-0.5 relative z-10`}
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const NotificationContainer = ({ notifications, removeNotification, lang = 'en' }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => removeNotification(notification.id)}
              duration={notification.duration}
              lang={lang}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, lang = 'en' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-triangle-exclamation text-amber-500 text-2xl"></i>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-600 font-medium text-sm leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-12 bg-slate-100 text-slate-700 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-slate-200 transition-colors"
          >
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-12 bg-rose-500 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
          >
            {lang === 'ar' ? 'تأكيد' : 'Confirm'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export { Notification, NotificationContainer, ConfirmDialog };
