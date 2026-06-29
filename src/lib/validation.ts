/**
 * Validates whether a given string is a valid, well-formed URL.
 * Requires http:// or https:// protocol, a valid hostname/domain name with a TLD, and no spaces.
 * Rejects plain domain.com or simple words like 'a'.
 */
export function isValidUrl(urlStr: string): boolean {
  if (!urlStr) return false;
  const trimmed = urlStr.trim();
  const urlRegex = /^(https?:\/\/)(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,10}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i;
  return urlRegex.test(trimmed);
}

