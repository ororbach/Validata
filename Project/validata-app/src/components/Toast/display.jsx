// This component renders the visual representation of a toast notification.

// Renders the toast UI element with the appropriate animation and message content.
const ToastDisplay = ({ message, show }) => {
  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-opacity duration-300 z-50 ${
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Toast Message */}
      {message}
    </div>
  );
};

export default ToastDisplay;
