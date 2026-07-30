import { useState, useEffect } from "react";
import ChoreModal from "../../components/common/ChoreModal";

// 테스트용 임시 그룹 ID
const GROUP_ID = "group-001";

export default function Task() {
  const [chores, setChores] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChore, setEditingChore] = useState(null); // 수정할 데이터 상태

  // 1. 업무 목록 불러오기 (GET)
  const fetchChores = async () => {
    try {
      const response = await fetch(`/api/groups/${GROUP_ID}/chores`);
      if (response.ok) {
        const data = await response.json();
        setChores(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch chores:", error);
    }
  };

  // 컴포넌트 마운트 시 최초 1회 실행
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`/api/groups/${GROUP_ID}/chores`);
        if (response.ok) {
          const data = await response.json();
          setChores(data.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch chores:", error);
      }
    })();
  }, []);

  // 2. 모달 열기 핸들러
  const openAddModal = () => {
    setEditingChore(null); // 새 업무이므로 null로 초기화
    setIsModalOpen(true);
  };

  const openEditModal = (chore) => {
    setEditingChore(chore); // 수정할 업무 데이터 세팅
    setIsModalOpen(true);
  };

  // 3. 폼 제출 핸들러 (생성 & 수정 통합)
  const handleChoreSubmit = async (formData) => {
    try {
      if (editingChore) {
        // [수정] PATCH 요청
        await fetch(`/api/groups/${GROUP_ID}/chores/${editingChore.choreId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // [생성] POST 요청
        await fetch(`/api/groups/${GROUP_ID}/chores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      // 저장 완료 후 목록 새로고침 및 모달 닫기
      await fetchChores();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to submit chore:", error);
    }
  };

  // 4. 삭제 핸들러 (DELETE)
  const handleDelete = async (choreId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await fetch(`/api/groups/${GROUP_ID}/chores/${choreId}`, {
        method: "DELETE",
      });
      fetchChores(); // 삭제 후 목록 새로고침
    } catch (error) {
      console.error("Failed to delete chore:", error);
    }
  };

  return (
    <div className="min-h-screen p-8 font-sans bg-[#F7F4EF]">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between max-w-4xl mx-auto mb-6">
        <div>
          <p className="mb-2 text-sm text-gray-500">
            반복과 담당자를 편하게 관리해요
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900">업무·관리</h1>
        </div>
        <button
          onClick={openAddModal}
          className="px-6 py-3 font-bold text-white transition-colors bg-[#C8494C] rounded-full hover:bg-[#b84a4a]"
        >
          + 업무 추가
        </button>
      </div>

      {/* 리스트 영역 */}
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 shadow-sm rounded-2xl">
        {/* 리스트 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <span className="text-sm font-bold text-gray-500">업무</span>
          <div className="flex gap-4 text-sm font-bold text-gray-500">
            <span>반복</span>
            <span>관리</span>
          </div>
        </div>

        {/* 업무 아이템들 */}
        <ul>
          {chores.map((chore) => (
            <li
              key={chore.choreId}
              className="flex items-center justify-between px-6 py-5 border-b border-gray-100 last:border-0 hover:bg-gray-50"
            >
              {/* 왼쪽: 제목 및 설명 */}
              <div className="flex items-center gap-4">
                <span className="text-2xl">🧹</span> {/* 임시 이모지 아이콘 */}
                <div>
                  <h3 className="font-bold text-gray-900">{chore.name}</h3>
                  <p className="text-xs text-gray-400">
                    마감 정보 연동 필요 · 로테이션 4명
                  </p>
                </div>
              </div>

              {/* 오른쪽: 뱃지, 프로필, 수정/삭제 버튼 */}
              <div className="flex items-center gap-3">
                {/* 반복 뱃지 */}
                <span className="px-3 py-1 text-xs font-bold text-gray-600 bg-gray-100 rounded-full">
                  {chore.schedule?.frequency === "DAILY"
                    ? "매일"
                    : chore.schedule?.frequency === "WEEKLY"
                      ? "매주"
                      : "격주"}
                </span>

                {/* 담당자 아바타 (임시) */}
                <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white bg-red-400 rounded-full">
                  김
                </div>

                {/* 수정 버튼 */}
                <button
                  onClick={() => openEditModal(chore)}
                  className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                >
                  ✏️
                </button>

                {/* 삭제 버튼 */}
                <button
                  onClick={() => handleDelete(chore.choreId)}
                  className="p-2 text-gray-400 transition-colors hover:text-red-500"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}

          {chores.length === 0 && (
            <div className="py-10 text-center text-gray-400">
              등록된 업무가 없습니다.
            </div>
          )}
        </ul>
      </div>

      {/* 모달 컴포넌트 렌더링 */}
      {isModalOpen && (
        <ChoreModal
          // 수정 모드일 땐 choreId를, 생성 모드일 땐 'new'를 key로 줘서 모달을 완벽히 초기화합니다.
          key={editingChore ? editingChore.choreId : "new-chore"}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingChore}
          onSubmit={handleChoreSubmit}
        />
      )}
    </div>
  );
}
