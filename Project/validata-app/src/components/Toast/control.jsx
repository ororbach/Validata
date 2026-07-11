// This component manages the state and visibility duration of the toast notifications.
import { useEffect } from 'react';
import ToastDisplay from './display';
import { TOAST_DURATION } from './service';

// Controls the display timer and automatically hides the toast notification.
const ToastControl = ({ message, show, onHide }) => {
  // Managing timer
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, TOAST_DURATION);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  return <ToastDisplay message={message} show={show} />;
};

export default ToastControl;
