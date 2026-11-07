const MOBILE_OR_TABLET_USER_AGENT =
  /android|iphone|ipad|ipod|mobile|tablet|kindle|silk|playbook|blackberry/i;

export function supportsReportDevice({
  userAgent,
  platform,
  maxTouchPoints,
  hasCoarsePointer,
}: {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
  hasCoarsePointer: boolean;
}): boolean {
  if (MOBILE_OR_TABLET_USER_AGENT.test(userAgent)) {
    return true;
  }

  const isTouchIPad = platform === "MacIntel" && maxTouchPoints > 1;
  const isTouchFirstDevice = hasCoarsePointer && maxTouchPoints > 0;

  return isTouchIPad || isTouchFirstDevice;
}
