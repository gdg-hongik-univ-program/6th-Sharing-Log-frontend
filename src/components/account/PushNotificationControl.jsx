import {
  BellOff,
  BellRing,
  Smartphone,
} from "lucide-react";

import usePushSubscription from "../../hooks/usePushSubscription";

const PERMISSION_LABELS = {
  granted: "허용됨",
  denied: "차단됨",
  default: "아직 선택하지 않음",
  unsupported: "지원하지 않음",
};

function PushNotificationControl() {
  const {
    isSupported,
    isConfigured,
    isMockMode,
    isSubscribed,
    permission,
    isLoading,
    isUpdating,
    errorMessage,
    successMessage,
    enablePushNotification,
    disablePushNotification,
  } = usePushSubscription();

  const canEnable =
    isSupported &&
    isConfigured &&
    !isMockMode;

  return (
    <div className="mt-6 rounded-xl border border-[#1A1428]/10 p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#E63946]/10 text-[#E63946]">
          <Smartphone
            size={20}
            aria-hidden="true"
          />
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-black">
            이 기기에서 푸시 알림 받기
          </p>

          <p className="mt-1 text-xs leading-5 text-[#8B8575]">
            다른 PC나 휴대전화에서도 알림을
            받으려면 해당 기기에서 각각 한 번씩
            등록해야 해요.
          </p>
        </div>
      </div>

      <dl className="mt-4 grid gap-2 rounded-xl bg-[#F8F4EE] px-4 py-3 text-xs sm:grid-cols-2">
        <div className="flex items-center justify-between gap-3">
          <dt className="font-semibold text-[#8B8575]">
            브라우저 권한
          </dt>

          <dd className="font-bold">
            {PERMISSION_LABELS[
              permission
            ] ?? permission}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-3">
          <dt className="font-semibold text-[#8B8575]">
            구독 상태
          </dt>

          <dd
            className={`font-bold ${
              isSubscribed
                ? "text-[#087F67]"
                : "text-[#8B8575]"
            }`}
          >
            {isSubscribed
              ? "등록됨"
              : "등록 안 됨"}
          </dd>
        </div>
      </dl>

      {!isSupported && (
        <p className="mt-4 rounded-xl bg-[#FFB703]/10 px-4 py-3 text-xs font-semibold leading-5 text-[#8B6A00]">
          현재 브라우저에서는 웹 푸시
          알림을 지원하지 않아요.
        </p>
      )}

      {isSupported &&
        !isConfigured && (
          <p className="mt-4 rounded-xl bg-[#FFB703]/10 px-4 py-3 text-xs font-semibold leading-5 text-[#8B6A00]">
            VAPID 공개 키 넣어야함
          </p>
        )}

      {isMockMode && (
        <p className="mt-4 rounded-xl bg-[#FFB703]/10 px-4 py-3 text-xs font-semibold leading-5 text-[#8B6A00]">
          푸시 알림을 테스트하려면
          VITE_USE_MOCK_API를 false로
          설정해 주세요.
        </p>
      )}

      {permission === "denied" && (
        <p className="mt-4 rounded-xl bg-[#FFB703]/10 px-4 py-3 text-xs font-semibold leading-5 text-[#8B6A00]">
          알림 권한이 차단되어 있어요.
          브라우저의 사이트 설정에서 알림
          권한을 다시 허용해 주세요.
        </p>
      )}

      {errorMessage && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-[#E63946]/20 bg-[#E63946]/5 px-4 py-3 text-sm font-semibold leading-6 text-[#E63946]"
        >
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-[#06D6A0]/25 bg-[#06D6A0]/10 px-4 py-3 text-sm font-semibold leading-6 text-[#087F67]"
        >
          {successMessage}
        </p>
      )}

      <button
        type="button"
        disabled={
          isLoading ||
          isUpdating ||
          (!isSubscribed &&
            !canEnable)
        }
        onClick={
          isSubscribed
            ? disablePushNotification
            : enablePushNotification
        }
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${
          isSubscribed
            ? "border border-[#E63946] bg-white text-[#E63946] hover:bg-[#E63946]/5"
            : "bg-[#E63946] text-white hover:brightness-95"
        }`}
      >
        {isSubscribed ? (
          <BellOff
            size={17}
            aria-hidden="true"
          />
        ) : (
          <BellRing
            size={17}
            aria-hidden="true"
          />
        )}

        {isLoading
          ? "상태 확인 중..."
          : isUpdating
            ? "처리하는 중..."
            : isSubscribed
              ? "이 기기 알림 끄기"
              : "이 기기 알림 켜기"}
      </button>
    </div>
  );
}

export default PushNotificationControl;