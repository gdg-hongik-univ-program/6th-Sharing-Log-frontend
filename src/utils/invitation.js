const PENDING_INVITE_CODE_KEY =
  "gachi-salgi:pending-invite-code";

export function buildFrontendInviteUrl(code) {
  const url = new URL(
    "/join-house",
    window.location.origin,
  );

  url.searchParams.set(
    "inviteCode",
    code,
  );

  return url.toString();
}

export function savePendingInviteCode(code) {
  if (!code) return;

  window.sessionStorage.setItem(
    PENDING_INVITE_CODE_KEY,
    code,
  );
}

export function getPendingInviteCode() {
  return window.sessionStorage.getItem(
    PENDING_INVITE_CODE_KEY,
  );
}

export function clearPendingInviteCode() {
  window.sessionStorage.removeItem(
    PENDING_INVITE_CODE_KEY,
  );
}

export function getJoinHousePath(code) {
  const searchParams = new URLSearchParams({
    inviteCode: code,
  });

  return `/join-house?${searchParams.toString()}`;
}
