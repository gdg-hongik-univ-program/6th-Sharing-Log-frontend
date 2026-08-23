import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { buildFrontendInviteUrl } from "../utils/invitation";

export default function useInviteHouse() {
  const location = useLocation();
  const navigate = useNavigate();

  const [copiedTarget, setCopiedTarget] = useState(null);

  const houseName = location.state?.houseName;
  const inviteCode = location.state?.inviteCode;
  const inviteUrl = inviteCode
    ? buildFrontendInviteUrl(inviteCode)
    : "";
  const expiresAt = location.state?.expiresAt;

  useEffect(() => {
    if (!inviteCode) {
      navigate("/create-house", { replace: true });
    }
  }, [inviteCode, navigate]);

  async function copy(value, target) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedTarget(target);

      window.setTimeout(() => {
        setCopiedTarget(null);
      }, 2000);
    } catch {
      alert("복사하지 못했어요. 다시 시도해 주세요.");
    }
  }

  function handleStartHouse() {
    navigate("/home", {
      state: {
        groupId: location.state?.groupId,
        houseName,
      },
    });
  }

  return {
    houseName,
    inviteCode,
    inviteUrl,
    expiresAt,
    copiedTarget,
    copy,
    handleStartHouse,
  };
}
