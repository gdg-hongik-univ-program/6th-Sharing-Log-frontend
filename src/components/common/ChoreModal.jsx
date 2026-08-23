import { useState, useEffect, useRef } from "react";
import { useGroupMembers } from "../../hooks/useGroupMember";
import { extractEligibilityMemberIds } from "../../utils/choreUtils";

function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return formatDateInputValue(tomorrow);
}

const avatarColors = [
  "bg-red-400",
  "bg-green-400",
  "bg-yellow-500",
  "bg-blue-400",
  "bg-purple-400",
];

export default function ChoreModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  groupId,
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [frequency, setFrequency] = useState(
    initialData?.schedule?.frequency || "WEEKLY",
  );
  const [dueDate, setDueDate] = useState(
    initialData?.schedule?.dueTime?.slice(0, 5) || "20:00",
  );

  const [weeklyDueDay, setWeeklyDueDay] = useState(
    initialData?.schedule?.weeklyDueDay || "MONDAY",
  );
  const initialBiweeklyDueDate = initialData?.schedule?.biweeklyDueDate || "";
  const minimumBiweeklyDueDate = getTomorrowDate();
  const [biweeklyDueDate, setBiweeklyDueDate] = useState(
    initialBiweeklyDueDate || minimumBiweeklyDueDate,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { members, selectedIds, toggleMember, isLoading, setSelectedIds } =
    useGroupMembers(groupId);

  const isInitialized = useRef(false);

  useEffect(() => {
    const memberList = Array.isArray(members) ? members : members?.items || [];

    if (memberList.length > 0 && !isInitialized.current) {
      if (initialData) {
        if (initialData.eligibility?.mode === "ALL_ACTIVE_MEMBERS") {
          setSelectedIds(memberList.map((m) => m.membershipId));
        } else {
          setSelectedIds(
            extractEligibilityMemberIds(
              initialData.eligibility,
            ),
          );
        }
      } else {
        setSelectedIds(memberList.map((m) => m.membershipId));
      }
      isInitialized.current = true;
    }
  }, [members, initialData, setSelectedIds]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedIds.length === 0) {
      alert("최소 1명 이상의 멤버를 선택해주세요.");
      return;
    }

    const keepsExistingBiweeklyDueDate =
      initialData?.schedule?.frequency === "BIWEEKLY" &&
      biweeklyDueDate === initialBiweeklyDueDate;

    if (
      frequency === "BIWEEKLY" &&
      !keepsExistingBiweeklyDueDate &&
      biweeklyDueDate < minimumBiweeklyDueDate
    ) {
      setSubmitError("격주 첫 마감일은 내일부터 선택해 주세요.");
      return;
    }

    let formattedTime = dueDate || "20:00";
    if (formattedTime.length === 5) {
      formattedTime = `${formattedTime}:00`;
    }

    const schedule = {
      frequency,
      dueTime: formattedTime,
      weeklyDueDay: frequency === "WEEKLY" ? weeklyDueDay : null,
      biweeklyDueDate: frequency === "BIWEEKLY" ? biweeklyDueDate : null,
    };

    const memberListLength = Array.isArray(members)
      ? members.length
      : members?.items?.length || 0;
    const isAllMembers = selectedIds.length === memberListLength;

    const eligibility = {
      mode: isAllMembers ? "ALL_ACTIVE_MEMBERS" : "SELECTED_MEMBERS",
      membershipIds: isAllMembers ? [] : selectedIds,
    };

    try {
      setIsSubmitting(true);
      setSubmitError("");
      await onSubmit({ name, schedule, eligibility });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "업무를 저장하지 못했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const renderMembers = Array.isArray(members) ? members : members?.items || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md p-8 bg-white rounded-[32px] shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold text-red-500 uppercase">
              New Chore
            </p>
            <h2 className="text-2xl font-extrabold text-gray-900">
              {initialData ? "업무 수정하기" : "새 업무 만들기"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-gray-400 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">
              업무명
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 주방 정리"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-2 text-sm font-bold text-gray-700">
                반복 유형
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <option value="DAILY">매일</option>
                <option value="WEEKLY">매주</option>
                <option value="BIWEEKLY">격주</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-sm font-bold text-gray-700">
                마감 시간
              </label>
              <input
                type="time"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                required
              />
            </div>
          </div>

          {frequency === "WEEKLY" && (
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-700">
                마감 요일 설정
              </label>
              <select
                value={weeklyDueDay}
                onChange={(e) => setWeeklyDueDay(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <option value="MONDAY">월요일</option>
                <option value="TUESDAY">화요일</option>
                <option value="WEDNESDAY">수요일</option>
                <option value="THURSDAY">목요일</option>
                <option value="FRIDAY">금요일</option>
                <option value="SATURDAY">토요일</option>
                <option value="SUNDAY">일요일</option>
              </select>
            </div>
          )}

          {frequency === "BIWEEKLY" && (
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-700">
                격주 첫 마감일 (선택한 날짜부터 2주마다)
              </label>
              <input
                type="date"
                value={biweeklyDueDate}
                min={
                  initialBiweeklyDueDate &&
                  initialBiweeklyDueDate < minimumBiweeklyDueDate
                    ? initialBiweeklyDueDate
                    : minimumBiweeklyDueDate
                }
                onChange={(e) => {
                  setBiweeklyDueDate(e.target.value);
                  setSubmitError("");
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                required
              />
            </div>
          )}

          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">
              로테이션 멤버 선택{" "}
              <span className="font-normal text-gray-400">(최소 1명)</span>
            </label>

            {isLoading ? (
              <p className="text-sm text-gray-400">멤버를 불러오는 중...</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {renderMembers.map((member, index) => {
                  const isSelected = selectedIds.includes(member.membershipId);
                  const avatarColor = avatarColors[index % avatarColors.length];

                  return (
                    <button
                      key={member.membershipId}
                      type="button"
                      onClick={() => toggleMember(member.membershipId)}
                      className={`flex items-center gap-2 px-3 py-2 transition-all border rounded-full ${
                        isSelected
                          ? "border-red-400 bg-white"
                          : "border-gray-200 bg-gray-50 opacity-60"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-7 h-7 text-xs font-bold text-white rounded-full ${avatarColor}`}
                      >
                        {member.displayName.charAt(0)}
                      </div>
                      <span
                        className={`text-sm font-bold ${isSelected ? "text-gray-900" : "text-gray-500"}`}
                      >
                        {member.displayName}
                      </span>
                      {isSelected && (
                        <div className="flex items-center justify-center w-5 h-5 bg-red-400 rounded-full">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {submitError && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
            >
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={selectedIds.length === 0 || isSubmitting}
            className={`w-full py-4 text-lg font-bold text-white transition-colors rounded-xl ${
              selectedIds.length > 0 && !isSubmitting
                ? "bg-[#C8494C] hover:bg-[#b84a4a]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isSubmitting
              ? "저장 중..."
              : initialData
                ? "수정하기"
                : "생성하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
