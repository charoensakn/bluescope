import { Notification } from 'electron';

export type NotifyOptions = {
  message: string;
  onClick?: () => void;
  onClose?: () => void;
  onError?: (err?: Error) => void;
};

export function notify({ message, onClick, onClose, onError }: NotifyOptions) {
  if (Notification.isSupported()) {
    const n = new Notification({
      title: 'BlueScope',
      body: message,
    });
    n.on('click', () => {
      onClick?.();
    });
    n.on('close', () => {
      onClose?.();
    });
    n.show();
  } else {
    onError?.(new Error('Notifications are not supported on this platform'));
  }
}
