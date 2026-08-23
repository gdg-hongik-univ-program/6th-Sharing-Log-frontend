import { buildBackendUrl } from "./apiConfig";

// 현재 로그인한 사용자 정보를 가져오는 함수
export async function getCurrentUser() {
  const response = await fetch(
    buildBackendUrl("/api/auth/me"),
    {
      method: "GET",

      // 백엔드가 발급한 JSESSIONID 쿠키를 함께 보냅니다.
      credentials: "include",

      headers: {
        Accept: "application/json",
      },
    },
  );

  const contentType =
    response.headers.get("content-type") ?? "";

  if (!response.ok) {
    const error = new Error(
      `사용자 정보를 가져오지 못했습니다. (${response.status})`,
    );

    error.status = response.status;

    throw error;
  }

  // 정상적인 사용자 조회 응답은 JSON이어야 합니다.
  // 로그인 페이지 HTML 등이 반환되면 오류로 처리합니다.
  if (!contentType.includes("application/json")) {
    throw new Error(
      "사용자 정보 대신 JSON이 아닌 응답을 받았습니다.",
    );
  }

  return response.json();
}

// 서버에서 CSRF 토큰을 가져오는 함수
export async function getCsrfToken() {
  const response = await fetch(
    buildBackendUrl("/api/auth/csrf"),
    {
      method: "GET",

      // 로그인 세션 쿠키를 함께 보냅니다.
      credentials: "include",

      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const error = new Error(
      "보안 토큰을 가져오지 못했습니다.",
    );

    error.status = response.status;

    throw error;
  }

  return response.json();
}

// 닉네임을 저장하거나 수정하는 함수
export async function updateNickname({
  nickname,
  csrf,
}) {
  const response = await fetch(
    buildBackendUrl("/api/auth/me"),
    {
      method: "PATCH",

      // 로그인 세션 쿠키를 함께 보냅니다.
      credentials: "include",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",

        // Spring Security의 CSRF 검사를 통과하기 위한 헤더
        [csrf.headerName]: csrf.token,
      },

      body: JSON.stringify({
        nickname,
      }),
    },
  );

  if (!response.ok) {
    const error = new Error(
      "닉네임을 저장하지 못했습니다.",
    );

    error.status = response.status;

    throw error;
  }

  return response.json();
}

// 현재 로그인 세션을 종료하는 함수
export async function logout() {
  const response = await fetch(
    buildBackendUrl("/api/auth/logout"),
    {
      method: "POST",

      // 로그아웃할 JSESSIONID 쿠키를 함께 보냅니다.
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("로그아웃에 실패했습니다.");
  }
}
