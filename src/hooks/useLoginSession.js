import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { buildBackendUrl } from "../api/apiConfig";
import { getCurrentUser } from "../api/authApi";
import { getMyGroups } from "../api/groupApi";
import {
  clearActiveGroupId,
  resolveActiveGroup,
} from "../utils/activeGroup";
import {
  getJoinHousePath,
  getPendingInviteCode,
} from "../utils/invitation";

export default function useLoginSession() {
  const navigate = useNavigate();

  const loginFailed =
    new URLSearchParams(
      window.location.search,
    ).get("error") === "true";

  const [
    isCheckingSession,
    setIsCheckingSession,
  ] = useState(!loginFailed);

  const [sessionError, setSessionError] =
    useState("");

  useEffect(() => {
    if (loginFailed) {
      return undefined;
    }

    let cancelled = false;

    async function checkLoginSession() {
      setIsCheckingSession(true);
      setSessionError("");

      try {
        // 현재 로그인한 사용자를 조회합니다.
        const user = await getCurrentUser();

        if (cancelled) {
          return;
        }

        // 닉네임이 없으면 정보 입력 화면으로 이동합니다.
        if (!user.nickname?.trim()) {
          navigate("/profile-setup", {
            replace: true,
          });

          return;
        }

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

        // 가입한 전체 하우스 목록을 가져옵니다.
        const groups = await getMyGroups();

        if (cancelled) {
          return;
        }

        // 하우스가 없다면 생성·참여 화면으로 이동합니다.
        if (groups.length === 0) {
          clearActiveGroupId();

          navigate("/house-choice", {
            replace: true,
          });

          return;
        }

        // 전에 선택한 하우스가 있거나
        // 가입한 하우스가 한 개라면 현재 하우스를 결정합니다.
        const activeGroup =
          resolveActiveGroup(groups);

        if (activeGroup) {
          navigate("/home", {
            replace: true,
          });

          return;
        }

        // 여러 하우스가 있지만 선택된 하우스가 없다면
        // 하우스 선택 화면으로 이동합니다.
        navigate("/house-choice", {
          replace: true,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        // 비로그인 사용자의 401 응답은 정상입니다.
        if (error.status === 401) {
          return;
        }

        console.error(
          "로그인 후 이동할 화면을 결정하지 못했습니다.",
          error,
        );

        setSessionError(
          error.message ??
            "사용자 정보를 확인하지 못했습니다.",
        );
      } finally {
        if (!cancelled) {
          setIsCheckingSession(false);
        }
      }
    }

    checkLoginSession();

    return () => {
      cancelled = true;
    };
  }, [loginFailed, navigate]);

  // OAuth 로그인은 fetch가 아니라
  // 백엔드 로그인 주소로 브라우저 전체를 이동합니다.
  function handleSocialLogin(provider) {
    window.location.href = buildBackendUrl(
      `/oauth2/authorization/${provider}`,
    );
  }

  return {
    loginFailed,
    isCheckingSession,
    sessionError,
    handleSocialLogin,
  };
}
