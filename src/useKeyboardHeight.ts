/**
 * useKeyboardHeight.ts
 * 
 * A modern custom hook that uses the visualViewport API to detect when the
 * on-screen keyboard is visible on mobile browsers (Android Chrome, iOS Safari).
 *
 * Unlike window resize events (which are unreliable on mobile), visualViewport
 * fires accurately when the keyboard appears and disappears.
 *
 * Usage:
 *   const { isKeyboardVisible, viewportHeight } = useKeyboardHeight();
 */

import { useState, useEffect } from 'react';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';

interface KeyboardState {
  /** True when the on-screen keyboard is visible */
  isKeyboardVisible: boolean;
  /** The current visual viewport height (shrinks when keyboard opens) */
  viewportHeight: number;
  /** Visual height of the keyboard in pixels */
  keyboardHeight: number;
}

export function useKeyboardHeight(): KeyboardState {
  const [state, setState] = useState<KeyboardState>({
    isKeyboardVisible: false,
    viewportHeight: window.innerHeight,
    keyboardHeight: 0,
  });

  useEffect(() => {
    let showListener: any;
    let hideListener: any;

    const setupKeyboardListeners = async () => {
      // Set the resize mode at the hook level to guarantee Capacitor behavior
      try {
        await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
      } catch (e) {
        console.log("Keyboard plugin not fully active (might be web environment)");
      }

      showListener = await Keyboard.addListener('keyboardWillShow', info => {
        const keyboardHeight = info.keyboardHeight;
        const windowHeight = window.innerHeight;
        const newViewportHeight = windowHeight - keyboardHeight;

        setState({
          isKeyboardVisible: true,
          viewportHeight: newViewportHeight,
          keyboardHeight: keyboardHeight,
        });

        const root = document.getElementById('keyboard-root');
        if (root) {
          root.style.height = `${newViewportHeight}px`;
        }
      });

      hideListener = await Keyboard.addListener('keyboardWillHide', () => {
        const windowHeight = window.innerHeight;
        setState({
          isKeyboardVisible: false,
          viewportHeight: windowHeight,
          keyboardHeight: 0,
        });

        const root = document.getElementById('keyboard-root');
        if (root) {
          root.style.height = `${windowHeight}px`;
        }
      });
    };

    setupKeyboardListeners();

    // Fallback for visualViewport (when running on pure web browser)
    const viewport = window.visualViewport;
    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const currentHeight = viewport ? viewport.height : windowHeight;
      const KEYBOARD_THRESHOLD = 0.80;
      
      // Only apply web fallback if capacitor isn't shrinking the viewport height accurately
      // and a keyboard seems open.
      if (currentHeight < windowHeight * KEYBOARD_THRESHOLD) {
         setState({
           isKeyboardVisible: true,
           viewportHeight: currentHeight,
           keyboardHeight: windowHeight - currentHeight,
         });
         const root = document.getElementById('keyboard-root');
         if (root) {
           root.style.height = `${currentHeight}px`;
         }
      } else if (!state.isKeyboardVisible) {
        // Safe reset if Capacitor didn't catch it
        setState(prev => ({
          ...prev,
          viewportHeight: currentHeight,
        }));
         const root = document.getElementById('keyboard-root');
         if (root) {
           root.style.height = `${currentHeight}px`;
         }
      }
    };

    if (viewport) {
      viewport.addEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (showListener) showListener.remove();
      if (hideListener) hideListener.remove();
      if (viewport) {
        viewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return state;
}
