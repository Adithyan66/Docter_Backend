export function normalizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  let normalized = url.trim();

  try {
    const urlObj = new URL(normalized);
    
    normalized = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
    
    normalized = normalized.replace(/\/+$/, '');
    
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  } catch (error) {
    normalized = normalized.split('?')[0];
    normalized = normalized.replace(/\/+$/, '');
    return normalized;
  }
}

