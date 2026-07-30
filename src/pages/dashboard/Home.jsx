import { useState } from "react";
import { useNavigate } from "react-router";
import { mockMyTasks, mockNotices } from "../../mocks/homeData";
import TaskCard from "../../components/common/TaskCard";
import NoticeItem from "../../components/common/NoticeItem";
import { LuBell } from "react-icons/lu";
// 실제 날짜 함수
const getFormattedToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const dayName = days[now.getDay()];

  return `${year}년 ${month}월 ${date}일 · ${dayName}요일`;
};

function Home() {
  const userName = "지수";
  const today = getFormattedToday();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState(() => {
    const savedTasks = JSON.parse(localStorage.getItem("activeTasks"));
    if (savedTasks && savedTasks.length > 0) {
      return savedTasks;
    }
    return mockMyTasks;
  });

  const handleCompleteTask = (taskToComplete) => {
    // 현재 진행 중인 목록에서 해당 업무 제거
    const updatedTasks = tasks.filter((task) => task.id !== taskToComplete.id);
    setTasks(updatedTasks);
    localStorage.setItem("activeTasks", JSON.stringify(updatedTasks));

    const existingCompleted =
      JSON.parse(localStorage.getItem("completedTasks")) || [];

    // 이미 완료 목록에 똑같은 업무(id)가 있는지 검사
    const isDuplicate = existingCompleted.some(
      (task) => task.id === taskToComplete.id,
    );

    // 중복이 아닐 때만 추가
    if (!isDuplicate) {
      const updatedCompleted = [...existingCompleted, taskToComplete];
      localStorage.setItem("completedTasks", JSON.stringify(updatedCompleted));
    }
  };
  return (
    // 전체 배경 및 패딩 설정
    <div className="min-h-screen bg-[#F7F4EF] px-5 py-10">
      {/* 상단 헤더 */}
      <header className="flex items-center justify-between mb-10">
        <div>
          <p className="text-sm text-[#888] mb-2">{today}</p>
          <h1 className="text-[28px] font-black text-[#222]">
            안녕하세요, {userName}님 👋
          </h1>
        </div>
        <button className="flex items-center justify-center w-12 h-12 text-xl bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.05)] cursor-pointer">
          <LuBell className="w-[18px] h-[18px]" />
        </button>
      </header>

      {/* 업무 섹션 */}
      <section className="mb-12">
        <header className="flex items-end justify-between mb-5">
          <div>
            <h2 className="flex items-center gap-1.5 text-lg font-bold mb-1">
              <span className="text-[#E53E3E] text-xs">🔴</span> 오늘과 이번 주,
              내 업무
            </h2>
            <p className="text-[13px] text-[#888]">
              완료하면 홈에서 사라지고 완료 업무에서 다시 볼 수 있어요.
            </p>
          </div>
          {/* 남은 개수 뱃지 */}
          <span className="px-3.5 py-1.5 bg-[#FCE8E8] text-[#D9534F] rounded-full text-[13px] font-bold">
            {tasks.length}개 남음
          </span>
        </header>

        {/* 업무 리스트 (가로 스크롤 적용) */}
        <ul className="flex gap-4 pb-2 overflow-x-auto">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={handleCompleteTask}
            />
          ))}
        </ul>
      </section>

      {/* 공지 섹션 */}
      <section>
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">최근 공지</h2>
          {/* 전체 보기 클릭 시 /notice 경로로 이동 */}
          <button
            onClick={() => navigate("/notice")}
            className="text-[#D9534F] text-[14px] font-bold cursor-pointer bg-transparent"
          >
            전체 보기
          </button>
        </header>

        <ul className="bg-white border border-gray-100 rounded-[16px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
          {mockNotices.map((notice, index) => (
            <NoticeItem
              key={notice.id}
              notice={notice}
              isLast={index === mockNotices.length - 1}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Home;
