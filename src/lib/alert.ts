import { Alert as NativeAlert, Platform } from 'react-native';
import type { AlertButton } from 'react-native';

/**
 * Cross-platform Alert. react-native-web's Alert.alert is a no-op, so on web
 * we fall back to window.alert / window.confirm while preserving button callbacks.
 */
function alert(title: string, message?: string, buttons?: AlertButton[]) {
  if (Platform.OS !== 'web') {
    NativeAlert.alert(title, message, buttons);
    return;
  }

  const text = [title, message].filter(Boolean).join('\n\n');

  if (!buttons || buttons.length === 0) {
    window.alert(text);
    return;
  }

  if (buttons.length === 1) {
    window.alert(text);
    buttons[0].onPress?.();
    return;
  }

  // Two or more buttons: map to confirm(). OK → first non-cancel button, Cancel → cancel button.
  const cancel = buttons.find((b) => b.style === 'cancel');
  const confirm = buttons.find((b) => b !== cancel) ?? buttons[buttons.length - 1];
  const label = confirm.text ? `\n\n(OK = ${confirm.text})` : '';

  if (window.confirm(text + label)) {
    confirm.onPress?.();
  } else {
    cancel?.onPress?.();
  }
}

export const Alert = { alert };
