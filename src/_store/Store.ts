import { Course } from '@/utils/types';
import { create } from 'zustand';

type UserState = {
  role: string | null;
  setRole: (role: string | null) => void;
};

type CoursesState = {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
};

const useUserStore = create<UserState>((set) => ({
  role: null,
  setRole: (role) => set({ role }),
}));

export const useCoursesStore = create<CoursesState>((set) => ({
  courses: [],
  setCourses: (courses) => set({ courses }),
}));


export default useUserStore;