/**
 * useKeyboardHeight.ts
 *
 * Strategy: "Trust the OS, Don't fight it."
 *
 * Since the Android Manifest is set to adjustResize, Android OS
 * will natively shrink the WebView when the keyboard opens.
 * Our ONLY job here is to track the keyboard's show/hide STATE
 * so the UI can react (e.g. hide headers, adjust padding).
 *
 * CRITICAL: We do NOT manipulate the DOM height or #keyboard-root.
 * Doing so creates a DOUBLE RESIZE conflict with adjustResize, causing
 * the infamous "flying screen with black gap" bug.
 */

import { useState, useEffect } from 'react';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';

interface KeyboardState {
  /** True when the on-screen keyboard is currently visible */
  isKeyboardVisible: boolean;
  /** The height reported by the keyboard in pixels (0 when hidden) */
  keyboardHeight: number;
}

export function useKeyboardHeight(): KeyboardState {
  const [state, setState] = useState<KeyboardState>({
    isKeyboardVisible: false,
    keyboardHeight: 0,
  });

  useEffect(() => {
    let showListener: any;
    let hideListener: any;

    const setup = async () => {
      try {
        // KeyboardResize.Native = Android OS handles all resizing.
        // Our JS code promises not to touch the DOM height.
        await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
      } catch (e) {
        // Not running in a Capacitor environment (e.g. web browser dev mode). That's fine.
        console.log('Capacitor Keyboard plugin not active - running in web mode.');
      }

      try {
        showListener = await Keyboard.addListener('keyboardWillShow', (info) => {
          // We only UPDATE STATE. We do NOT touch DOM heights.
          setState({
            isKeyboardVisible: true,
            keyboardHeight: info.keyboardHeight,
          });
        });

        hideListener = await Keyboard.addListener('keyboardWillHide', () => {
          setState({
            isKeyboardVisible: false,
            keyboardHeight: 0,
          });
        });
      } catch (e) {
        console.log('Capacitor Keyboard listeners failed:', e);
      }
    };

    setup();

    return () => {
      if (showListener) showListener.remove();
      if (hideListener) hideListener.remove();
    };
  }, []);

  return state;
}
