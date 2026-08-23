import { useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router";

import { getCsrfToken } from "../api/authApi";
import { acceptInvitation } from "../api/invitationApi";
import {
  INVITE_CODE_LENGTH,
  INVITE_CODE_REGEX,
} from "../constants/invitation";
import { saveActiveGroupId } from "../utils/activeGroup";
import {
  clearPendingInviteCode,
  savePendingInviteCode,
} from "../utils/invitation";

export default function useJoinHouse() {
  const navigate = useNavigate();
  const [searchParams] =
    useSearchParams();

  const inviteCodeFromLink =
    searchParams.get("inviteCode") ?? "";

  const [typedCode, setTypedCode] =
    useState(inviteCodeFromLink);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isJoining, setIsJoining] =
    useState(false);

  const cleanCode = typedCode.trim();

  function handleInputChange(event) {
    setTypedCode(event.target.value);
    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const isValidCode =
      INVITE_CODE_REGEX.test(cleanCode);

    if (!isValidCode) {
      setErrorMessage(
        `영문, 숫자, -, _로 이루어진 ${INVITE_CODE_LENGTH}자리 코드를 입력해 주세요.`,
      );

      return;
    }

    try {
      setErrorMessage("");
      setIsJoining(true);

      const csrf = await getCsrfToken();

      const joinedGroup =
        await acceptInvitation({
          code: cleanCode,
          csrf,
        });

      // 참가한 하우스를 현재 하우스로 저장합니다.
      saveActiveGroupId(
        joinedGroup.groupPublicId,
      );

      clearPendingInviteCode();

      navigate("/home", {
        replace: true,
      });
    } catch (error) {
      if (error?.status === 401) {
        savePendingInviteCode(
          cleanCode,
        );

        navigate("/", {
          replace: true,
        });

        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "하우스 참가에 실패했습니다.",
      );
    } finally {
      setIsJoining(false);
    }
  }

  return {
    typedCode,
    cleanCode,
    errorMessage,
    isJoining,
    handleInputChange,
    handleSubmit,
    navigate,
  };
}
