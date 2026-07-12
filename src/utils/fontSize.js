// שולט בהגדלת גופן לנגישות — נשמר בתוך reactwork-settings.fontSize
// ('normal' | 'large' | 'xlarge') ומוחל כ-attribute על <html>.
export function applyFontSize(size) {
  if (size && size !== 'normal') {
    document.documentElement.setAttribute('data-font-size', size);
  } else {
    document.documentElement.removeAttribute('data-font-size');
  }
}

export function loadFontSize() {
  const settings = JSON.parse(localStorage.getItem('reactwork-settings') || '{}');
  return settings.fontSize || 'normal';
}
