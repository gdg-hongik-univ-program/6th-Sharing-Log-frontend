import { useState } from "react";
import { useNavigate } from "react-router";

import { getCsrfToken } from "../api/authApi";
import { reissueInvitation } from "../api/invitationApi";
import { buildFrontendInviteUrl } from "../utils/invitation";

export default function useReissueInvitation(
  groupPublicId,
) {
  const navigate = useNavigate();

  const [invitation, setInvitation] =
    useState(null);

  const [isReissuing, setIsReissuing] =
    useState(false);

  const [copiedTarget, setCopiedTarget] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleReissue() {
    if (!groupPublicId || isReissuing) {
      return;
    }

    const confirmed = window.confirm(
      "새로운 초대 링크를 발급할까요?"
    );

    if (!confirmed) return;

    setIsReissuing(true);
    setErrorMessage("");
    setCopiedTarget("");

    try {
      const csrf = await getCsrfToken();

      const newInvitation =
        await reissueInvitation({
          groupPublicId,
          csrf,
        });

      setInvitation({
        ...newInvitation,
        inviteUrl:
          buildFrontendInviteUrl(
            newInvitation.code,
          ),
      });
    } catch (error) {
      console.error(error);

      if (error.status === 401) {
        navigate("/", {
          replace: true,
        });

        return;
      }

      if (error.status === 403) {
        setErrorMessage(
          "하우스 관리자만 초대 링크를 발급할 수 있어요.",
        );

        return;
      }

      if (error.status === 404) {
        setErrorMessage(
          "초대 링크를 발급할 하우스를 찾을 수 없어요.",
        );

        return;
      }

      setErrorMessage(
        error.message ??
          "초대 링크를 재발급하지 못했습니다.",
      );
    } finally {
      setIsReissuing(false);
    }
  }

  async function copyInvitation(
    value,
    target,
  ) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(
        value,
      );

      setCopiedTarget(target);

      window.setTimeout(() => {
        setCopiedTarget("");
      }, 2000);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "복사하지 못했어요. 다시 시도해 주세요.",
      );
    }
  }

  return {
    invitation,
    isReissuing,
    copiedTarget,
    errorMessage,
    handleReissue,
    copyInvitation,
  };
}
