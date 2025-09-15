"use client";

import { useEffect, useRef } from "react";

// Accessibility utilities and hooks

// Hook for managing focus
export function useFocusManagement() {
  const focusRef = useRef<HTMLElement>(null);

  const setFocus = () => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  };

  const focusFirstFocusableElement = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    if (firstElement) {
      firstElement.focus();
    }
  };

  const focusLastFocusableElement = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;
    if (lastElement) {
      lastElement.focus();
    }
  };

  return {
    focusRef,
    setFocus,
    focusFirstFocusableElement,
    focusLastFocusableElement,
  };
}

// Hook for managing ARIA live regions
export function useLiveRegion(_politeness: "polite" | "assertive" = "polite") {
  const liveRef = useRef<HTMLDivElement>(null);

  const announce = (message: string) => {
    if (liveRef.current) {
      liveRef.current.textContent = message;
    }
  };

  const clear = () => {
    if (liveRef.current) {
      liveRef.current.textContent = "";
    }
  };

  return {
    liveRef,
    announce,
    clear,
  };
}

// Hook for keyboard navigation
export function useKeyboardNavigation(
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void,
  onArrowLeft?: () => void,
  onArrowRight?: () => void
) {
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Enter":
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;
      case "Escape":
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case "ArrowUp":
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp();
        }
        break;
      case "ArrowDown":
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown();
        }
        break;
      case "ArrowLeft":
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft();
        }
        break;
      case "ArrowRight":
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight();
        }
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight]);

  return { handleKeyDown };
}

// Utility function to generate unique IDs for ARIA relationships
export function useUniqueId(prefix = "id") {
  const idRef = useRef<string>();

  if (!idRef.current) {
    idRef.current = `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  return idRef.current;
}

// Hook for managing skip links
export function useSkipLinks() {
  const skipToMain = () => {
    const main = document.querySelector("main");
    if (main) {
      main.focus();
      main.scrollIntoView();
    }
  };

  const skipToNavigation = () => {
    const nav = document.querySelector("nav");
    if (nav) {
      nav.focus();
      nav.scrollIntoView();
    }
  };

  return {
    skipToMain,
    skipToNavigation,
  };
}

// Utility function to get accessible text for icons
export function getIconAriaLabel(iconName: string, context?: string): string {
  const baseLabels: Record<string, string> = {
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    remove: "Remove",
    close: "Close",
    open: "Open",
    save: "Save",
    cancel: "Cancel",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    refresh: "Refresh",
    download: "Download",
    upload: "Upload",
    share: "Share",
    copy: "Copy",
    paste: "Paste",
    cut: "Cut",
    undo: "Undo",
    redo: "Redo",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    fullscreen: "Fullscreen",
    settings: "Settings",
    help: "Help",
    info: "Information",
    warning: "Warning",
    error: "Error",
    success: "Success",
    loading: "Loading",
    menu: "Menu",
    more: "More options",
    back: "Go back",
    forward: "Go forward",
    home: "Home",
    profile: "Profile",
    logout: "Logout",
    login: "Login",
    register: "Register",
  };

  const baseLabel = baseLabels[iconName] || iconName;
  return context ? `${baseLabel} ${context}` : baseLabel;
}

// Hook for managing reduced motion preferences
export function useReducedMotion() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  return prefersReducedMotion;
}

// Utility function to create accessible button props
export function getAccessibleButtonProps(
  isDisabled?: boolean,
  isLoading?: boolean,
  ariaLabel?: string,
  ariaDescribedBy?: string
) {
  return {
    disabled: isDisabled || isLoading,
    "aria-disabled": isDisabled || isLoading,
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescribedBy,
    "aria-busy": isLoading,
  };
}

// Utility function to create accessible form field props
export function getAccessibleFieldProps(
  id: string,
  _label: string,
  error?: string,
  description?: string,
  required?: boolean
) {
  const labelId = `${id}-label`;
  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;

  const ariaDescribedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return {
    id,
    "aria-labelledby": labelId,
    "aria-describedby": ariaDescribedBy,
    "aria-required": required,
    "aria-invalid": !!error,
    labelProps: {
      id: labelId,
      htmlFor: id,
    },
    errorProps: errorId
      ? {
          id: errorId,
          role: "alert",
          "aria-live": "polite",
        }
      : undefined,
    descriptionProps: descriptionId
      ? {
          id: descriptionId,
        }
      : undefined,
  };
}

// Screen reader only utility - use with CSS class "sr-only"
export function getScreenReaderOnlyProps() {
  return {
    className: "sr-only",
  };
}

// Focus trap utility for modals and dialogs
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // This should be handled by the parent component
        // We just prevent default to avoid conflicts
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handleTabKey);
    document.addEventListener("keydown", handleEscapeKey);

    // Focus first element when trap becomes active
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleTabKey);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isActive]);

  return containerRef;
}
