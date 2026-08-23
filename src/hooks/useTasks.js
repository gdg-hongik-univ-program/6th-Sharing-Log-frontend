import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { choreApi } from "../api/choreApi";

export default function useTasks(groupId) {
  const [chores, setChores] =
    useState([]);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [
    editingChore,
    setEditingChore,
  ] = useState(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const loadChores = useCallback(
    async (currentGroupId) => {
      if (!currentGroupId) {
        return;
      }

      try {
        setIsLoading(true);

        const data =
          await choreApi.getChores(
            currentGroupId,
          );

        setChores(
          data.items ?? data ?? [],
        );
      } catch (error) {
        console.error(
          "업무 목록을 불러오지 못했습니다.",
          error,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Layout에서 activeGroup이 준비되면
  // 해당 하우스의 업무를 불러옵니다.
  useEffect(() => {
    if (!groupId) {
      return;
    }

    async function fetchInitialChores() {
      await loadChores(groupId);
    }

    fetchInitialChores();
  }, [groupId, loadChores]);

  function openAddModal() {
    setEditingChore(null);
    setIsModalOpen(true);
  }

  function openEditModal(chore) {
    setEditingChore(chore);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingChore(null);
  }

  async function handleChoreSubmit(
    formData,
  ) {
    if (!groupId) {
      throw new Error(
        "업무를 저장할 하우스 정보를 찾을 수 없습니다.",
      );
    }

    try {
      if (editingChore) {
        await choreApi.updateChore(
          groupId,
          editingChore.choreId,
          formData,
          String(
            editingChore.version,
          ),
        );
      } else {
        await choreApi.createChore(
          groupId,
          formData,
        );
      }

      await loadChores(groupId);
      closeModal();
    } catch (error) {
      console.error(
        "업무를 저장하지 못했습니다.",
        error,
      );

      throw error;
    }
  }

  async function handleDelete(
    choreId,
    version,
  ) {
    if (!groupId) {
      return;
    }

    const confirmed = window.confirm(
      "정말 삭제하시겠습니까?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await choreApi.deleteChore(
        groupId,
        choreId,
        String(version),
      );

      await loadChores(groupId);
    } catch (error) {
      console.error(
        "업무를 삭제하지 못했습니다.",
        error,
      );
    }
  }

  return {
    groupId,
    chores,
    isModalOpen,
    editingChore,
    isLoading,
    openAddModal,
    openEditModal,
    closeModal,
    handleChoreSubmit,
    handleDelete,
  };
}
