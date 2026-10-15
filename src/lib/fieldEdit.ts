function isTextField(el: Element | null): el is HTMLInputElement | HTMLTextAreaElement {
  if (el instanceof HTMLTextAreaElement) return true;
  if (!(el instanceof HTMLInputElement)) return false;
  return el.type === 'text' || el.type === 'search' || el.type === 'tel' || el.type === '';
}

export function focusedControl(): HTMLElement | null {
  const el = document.activeElement;
  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement
  ) {
    return el;
  }
  return null;
}

export function focusedTextField(): HTMLInputElement | HTMLTextAreaElement | null {
  const el = document.activeElement;
  return isTextField(el) ? el : null;
}

function setNativeValue(field: HTMLInputElement | HTMLTextAreaElement, next: string): void {
  const proto =
    field instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  setter?.call(field, next);
  field.dispatchEvent(new Event('input', { bubbles: true }));
}

export function insertText(field: HTMLInputElement | HTMLTextAreaElement, text: string): void {
  const start = field.selectionStart ?? field.value.length;
  const end = field.selectionEnd ?? field.value.length;
  let next = field.value.slice(0, start) + text + field.value.slice(end);
  if (field.maxLength > 0 && next.length > field.maxLength) {
    next = next.slice(0, field.maxLength);
  }
  setNativeValue(field, next);
  const caret = Math.min(start + text.length, next.length);
  field.setSelectionRange(caret, caret);
}

export function backspaceField(field: HTMLInputElement | HTMLTextAreaElement): void {
  const start = field.selectionStart ?? field.value.length;
  const end = field.selectionEnd ?? field.value.length;
  if (start !== end) {
    setNativeValue(field, field.value.slice(0, start) + field.value.slice(end));
    field.setSelectionRange(start, start);
    return;
  }
  if (start === 0) return;
  setNativeValue(field, field.value.slice(0, start - 1) + field.value.slice(end));
  field.setSelectionRange(start - 1, start - 1);
}
