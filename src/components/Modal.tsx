import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-full w-full sm:w-auto p-0 relative animate-fadeIn">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl font-bold z-10"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
        {title && <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">{title}</h3>
        </div>}
        {children}
      </div>
    </div>
  );
};

export default Modal;
export type { ModalProps }; 