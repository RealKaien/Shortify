export type ToastType = 'success' | 'info' | 'error';

export const toast = {
  show: (message: string, type: ToastType = 'success') => {
    const event = new CustomEvent('shortify-toast', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  },
  success: (message: string) => toast.show(message, 'success'),
  info: (message: string) => toast.show(message, 'info'),
  error: (message: string) => toast.show(message, 'error')
};
