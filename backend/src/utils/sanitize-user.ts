export type SanitizedUser<T> = Omit<T, 'password'>;

export function sanitizeUser<T extends { password?: unknown }>(
  user: T,
): SanitizedUser<T> {
  const { password: _password, ...safe } = user;
  void _password;
  return safe as SanitizedUser<T>;
}
