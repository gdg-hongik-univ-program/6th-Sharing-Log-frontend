import { useState, useEffect } from "react";
import { getAssignee } from "../../utils/rotationUtils"; // 유틸 함수 임포트 활성화 필요

// 🌟 추가된 부분: 오늘 날짜를 기준으로 동적 주차(월~일)를 계산하는 함수
const generateWeeks = () => {
  const today = new Date();
  const day = today.getDay();

  // 이번 주 월요일 날짜 구하기 (일요일이 0이므로 예외 처리)
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const thisMonday = new Date(today.setDate(diff));

  const weeks = [];
  for (let i = 0; i < 3; i++) {
    const start = new Date(thisMonday);
    start.setDate(thisMonday.getDate() + i * 7);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const formatDate = (date) => `${date.getMonth() + 1}/${date.getDate()}`;

    weeks.push({
      label: i === 0 ? "이번 주" : `${i}주 후`,
      dateRange: `${formatDate(start)} — ${formatDate(end)}`,
      isCurrent: i === 0,
    });
  }
  return weeks;
};

export default function RotationPage() {
  const [chores, setChores] = useState([]);

  // 🌟 변경된 부분: 초기 탭을 목데이터가 주로 있는 'WEEKLY'로 변경
  const [activeTab, setActiveTab] = useState("WEEKLY");
  const [expandedWeek, setExpandedWeek] = useState(0);

  // 계산된 날짜 데이터를 상태로 관리
  const [weeks, setWeeks] = useState([]);

  useEffect(() => {
    setWeeks(generateWeeks());

    const fetchChores = async () => {
      try {
        // 🌟 수정 1: 목데이터의 groupId인 'group-001'로 주소 변경
        const response = await fetch("/api/groups/group-001/chores");
        if (response.ok) {
          const data = await response.json();
          // API 응답 구조에 맞게 세팅 (items 배열이 어디있는지 확인 필요, 만약 바로 배열이면 data로 세팅)
          setChores(data.items || data || []);
        }
      } catch (error) {
        console.error("Failed to fetch chores:", error);
      }
    };
    fetchChores();
  }, []);

  // 선택된 탭에 맞게 필터링
  const filteredChores = chores.filter(
    (chore) => chore.schedule?.frequency === activeTab,
  );

  return (
    <div className="min-h-screen p-8 font-sans bg-[#F9F9F7]">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 영역 */}
        <div className="mb-8">
          <p className="mb-2 text-sm text-gray-500">우리 집 당번을 한눈에</p>
          <h1 className="text-3xl font-extrabold text-gray-900">
            업무 로테이션
          </h1>
        </div>

        {/* 탭 전환 영역 */}
        <div className="flex p-1 mb-6 bg-gray-100 rounded-full">
          {[
            { id: "DAILY", label: "매일 업무" },
            { id: "WEEKLY", label: "매주 업무" },
            { id: "BIWEEKLY", label: "격주 업무" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-sm font-bold rounded-full transition-all ${
                activeTab === tab.id
                  ? "bg-white shadow-sm text-red-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 안내 배너 */}
        <div className="p-5 mb-8 border border-green-200 bg-green-50 rounded-2xl">
          <p className="font-bold text-gray-800">
            <span className="mr-2">✨</span>
            로테이션은 구성원 순서대로 자동 배정돼요.
          </p>
          <p className="mt-1 ml-6 text-sm text-gray-500">
            대타가 수락된 업무는 기존 당번 대신 대타 멤버가 표시됩니다.
          </p>
        </div>

        {/* 주차별 아코디언 리스트 */}
        <div className="space-y-4">
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-3xl"
            >
              <button
                onClick={() =>
                  setExpandedWeek(expandedWeek === weekIndex ? null : weekIndex)
                }
                className="flex items-center justify-between w-full p-6 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {week.label} · {week.dateRange}
                  </h3>
                  {week.isCurrent && (
                    <span className="text-sm font-bold text-red-500">
                      진행 중인 주
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-gray-500">
                  {expandedWeek === weekIndex ? "▲" : "▼"}
                </div>
              </button>

              {expandedWeek === weekIndex && (
                <div className="px-6 pb-6">
                  {filteredChores.length > 0 ? (
                    <ul className="space-y-3">
                      {filteredChores.map((chore) => {
                        // 유틸 함수를 통해 당번 계산 (현재는 주석 처리되어 있으니 필요시 해제하세요)
                        const assignee = getAssignee(chore, weekIndex);
                        // const assignee = null; // 임시

                        return (
                          <li
                            key={chore.choreId}
                            className="flex items-center justify-between p-5 bg-[#F9F9F7] rounded-2xl"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-2xl">
                                {chore.name.includes("쓰레기") ? "🗑️" : "🍽️"}
                              </span>
                              <div>
                                <h4 className="font-bold text-gray-900">
                                  {chore.name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {chore.schedule?.dueTime || "기한 미정"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {assignee ? (
                                <>
                                  <div
                                    className={`flex items-center justify-center w-8 h-8 text-xs font-bold text-white rounded-full ${
                                      assignee.color || "bg-gray-400"
                                    }`}
                                  >
                                    {assignee.displayName.charAt(0)}
                                  </div>
                                  <span className="font-bold text-gray-900">
                                    {assignee.displayName}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm text-gray-400">
                                  담당자 미정
                                </span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="py-8 text-center text-gray-400">
                      해당 주기에 등록된 업무가 없습니다.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
