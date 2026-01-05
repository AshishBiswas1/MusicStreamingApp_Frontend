import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    const t = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const bg =
    type === 'success'
      ? 'bg-green-600'
      : type === 'error'
      ? 'bg-red-600'
      : 'bg-gray-800';

  return (
    <div
      className={`fixed right-6 bottom-6 z-50 ${bg} text-white px-4 py-3 rounded-lg shadow-lg`}
    >
      <div className="text-sm">{message}</div>
    </div>
  );
};

export default Toast;
