import { create } from 'zustand';

type UserState = {
  role: string | null;
  setRole: (role: string | null) => void;
};

const useUserStore = create<UserState>((set) => ({
  role: null,
  setRole: (role) => set({ role }),
}));

export default useUserStore;