interface JWTPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export function jwtDecode(token: string): JWTPayload {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return { id: '', role: '', iat: 0, exp: 0 };
  }
}
