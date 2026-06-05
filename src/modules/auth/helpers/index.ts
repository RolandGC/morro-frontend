// Funciones auxiliares para manejo de cookies
export const saveAuthToken = (token: string) => {
    if (typeof document === 'undefined') return;

    // Cookie válida por 7 días
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (7 * 24 * 60 * 60 * 1000));

    const expires = `expires=${expiryDate.toUTCString()}`;
    document.cookie = `access_token=${token}; ${expires}; path=/; SameSite=Strict`;
};

export const removeAuthToken = () => {
    if (typeof document === 'undefined') return;
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

export const getAuthToken = () => {
  if (typeof document === 'undefined') return null;
  const name = 'access_token=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return null;
};