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
    const viewport = window.visualViewport;

    const handleResize = () => {
      const windowHeight = window.innerHeight;
      // Use visualViewport.height if available (modern browsers)
      const currentHeight = viewport ? viewport.height : windowHeight;
      
      // Keyboard threshold: if viewport shrinks by more than 20%, keyboard is up
      const KEYBOARD_THRESHOLD = 0.80;
      const isKeyboardVisible = currentHeight < windowHeight * KEYBOARD_THRESHOLD;
      const keyboardHeight = isKeyboardVisible ? windowHeight - currentHeight : 0;

      setState({
        isKeyboardVisible,
        viewportHeight: currentHeight,
        keyboardHeight,
      });

      // *** THE GLOBAL FIX ***
      // Set the root container height = visible viewport height.
      // This makes ALL screens automatically avoid the keyboard.
      const root = document.getElementById('keyboard-root');
      if (root) {
        root.style.height = `${currentHeight}px`;
      }
    };

    // Set initial height
    handleResize();

    // Listen on visualViewport for accurate mobile keyboard detection
    if (viewport) {
      viewport.addEventListener('resize', handleResize);
      viewport.addEventListener('scroll', handleResize);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (viewport) {
        viewport.removeEventListener('resize', handleResize);
        viewport.removeEventListener('scroll', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return state;
}
