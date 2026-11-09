export function isMissingAuthSessionError(error: { name?: string } | null): boolean {
  return error?.name === "AuthSessionMissingError";
}
