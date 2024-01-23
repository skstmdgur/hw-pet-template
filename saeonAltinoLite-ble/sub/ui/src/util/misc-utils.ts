export function sleepAsync(milli: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milli);
  });
}

export function isValidURL(str: string | null | undefined): boolean {
  if (typeof str !== 'string') return false;
  if (str.length === 0) return false;
  try {
    return Boolean(new URL(str));
  } catch (e) {
    return false;
  }
}

const queryElement = (el: HTMLElement | Document | null | undefined, selector: string) => {
  if (!el) return null;
  return el.querySelector(selector);
};

export const requestFocusSelector = (
  parent: HTMLElement | Document | undefined | null,
  selector: string,
  delay = -1,
) => {
  if (!parent) return;
  if (delay < 0) {
    const elem = parent.querySelector<HTMLInputElement>(selector);
    elem?.focus();
    return;
  }

  setTimeout(() => {
    const elem = parent.querySelector<HTMLInputElement>(selector);
    elem?.focus();
  }, delay);
};

export const requestSelector = (
  el: HTMLElement | Document | null | undefined,
  selector: string,
  callback: (elemnt: HTMLElement) => unknown,
  timeout = -1,
) => {
  if (timeout < 0) {
    const element = queryElement(el, selector);
    if (element) {
      callback(element as HTMLElement);
    }
    return;
  }

  setTimeout(() => {
    const element = queryElement(el, selector);
    if (element) {
      callback(element as HTMLElement);
    }
  }, timeout);
};

export function isWebSerialSupportBrowser(): boolean {
  return window.navigator && 'serial' in window.navigator;
}

export function isTouchDevice(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  );
}

export function matchesOrClosest<T extends HTMLElement>(
  target: Element,
  selector: string,
): T | undefined {
  const found = target.matches(selector) ? target : target.closest(selector);
  if (found) {
    return found as T;
  }
  return undefined;
}

export function cancelCtx(ctx?: { canceled: boolean; cancel?: () => void }) {
  if (!ctx) return;
  if (ctx.canceled) return;
  ctx.canceled = true;
  ctx.cancel?.();
}
