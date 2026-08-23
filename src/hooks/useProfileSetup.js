import { useState } from "react";
import { useNavigate } from "react-router";

import {
  getCsrfToken,
  updateNickname,
} from "../api/authApi";
import { getMyGroups } from "../api/groupApi";
import {
  clearActiveGroupId,
  resolveActiveGroup,
} from "../utils/activeGroup";
import {
  getJoinHousePath,
  getPendingInviteCode,
} from "../utils/invitation";

const MAX_NICKNAME_LENGTH = 20;

export default function useProfileSetup() {
  const navigate = useNavigate();

  const [nickname, setNickname] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const normalizedNickname =
    nickname.trim();

  const isNicknameValid =
    normalizedNickname.length >= 1 &&
    normalizedNickname.length <=
      MAX_NICKNAME_LENGTH;

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !isNicknameValid ||
      isSubmitting
    ) {
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const csrf = await getCsrfToken();

      // 입력한 닉네임을 저장합니다.
      await updateNickname({
        nickname: normalizedNickname,
        csrf,
      });

      const pendingInviteCode =
        getPendingInviteCode();

      if (pendingInviteCode) {
        navigate(
          getJoinHousePath(
            pendingInviteCode,
          ),
          { replace: true },
        );

        return;
      }

      // 사용자가 가입한 모든 하우스를 조회합니다.
      const groups = await getMyGroups();

      if (groups.length === 0) {
        clearActiveGroupId();

        navigate("/house-choice", {
          replace: true,
        });

        return;
      }

      const activeGroup =
        resolveActiveGroup(groups);

      if (activeGroup) {
        navigate("/home", {
          replace: true,
        });

        return;
      }

      // 여러 하우스 중 선택된 하우스가 없다면
      // 하우스 선택 화면으로 이동합니다.
      navigate("/house-choice", {
        replace: true,
      });
    } catch (error) {
      if (error.status === 401) {
        navigate("/", {
          replace: true,
        });

        return;
      }

      setErrorMessage(
        error.message ??
          "처리 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    nickname,
    setNickname,
    errorMessage,
    isSubmitting,
    isNicknameValid,
    maxNicknameLength:
      MAX_NICKNAME_LENGTH,
    handleSubmit,
  };
}
