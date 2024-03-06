export const isTabKeyEvent = (e: React.KeyboardEvent): boolean => {
  return !e.shiftKey && e.key === 'Tab';
};

export const isEnterOrTabKeyEvent = (e: React.KeyboardEvent): boolean => {
  return e.key === 'Enter' || (!e.shiftKey && e.key === 'Tab');
};

export const isEnterKeyEvent = (e: React.KeyboardEvent): boolean => {
  return e.key === 'Enter';
};

export const isEscapeKeyEvent = (e: React.KeyboardEvent): boolean => {
  return e.key === 'Escape';
};

export const isTouchEvent = (event: MouseEvent | TouchEvent): event is TouchEvent => {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return Boolean((event as TouchEvent).touches && (event as TouchEvent).touches.length);
};

export const isMouseEvent = (event: MouseEvent | TouchEvent): event is MouseEvent => {
  return Boolean(
    ((event as MouseEvent).clientX || (event as MouseEvent).clientX === 0) &&
      ((event as MouseEvent).clientY || (event as MouseEvent).clientY === 0),
  );
};

export const blurEventTarget = (event: any) => {
  if (typeof event.target?.blur === 'function') {
    event.target.blur();
  }
};
