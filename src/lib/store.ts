import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Technician, ServiceBox, Schedule, Service, Shift, Team, ServiceStatus } from '@/types';

type AppMode = 'edit' | 'view';

interface AppState {
  technicians: Technician[];
  schedules: Schedule[];
  currentSchedule: Schedule | null;
  mode: AppMode;
  
  // Mode
  setMode: (mode: AppMode) => void;
  
  // Technicians
  addTechnician: (name: string) => void;
  removeTechnician: (id: string) => void;
  
  // Schedules
  createSchedule: (date: string, shift: Shift) => void;
  setCurrentSchedule: (schedule: Schedule | null) => void;
  deleteSchedule: (id: string) => void;
  
  // Boxes
  addBox: (scheduleId: string) => void;
  removeBox: (scheduleId: string, boxId: string) => void;
  updateBoxTeam: (scheduleId: string, boxId: string, team: Team | null) => void;
  updateBoxStatus: (scheduleId: string, boxId: string, status: string) => void;
  
  // Services
  addService: (scheduleId: string, boxId: string, service: Omit<Service, 'id'>) => void;
  removeService: (scheduleId: string, boxId: string, serviceId: string) => void;
  updateServiceStatus: (scheduleId: string, boxId: string, serviceId: string, status: ServiceStatus, completedAt: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      technicians: [
        { id: '1', name: 'WESLEY' },
        { id: '2', name: 'YURI' },
        { id: '3', name: 'EVERTON' },
        { id: '4', name: 'DANIEL' },
        { id: '5', name: 'BRUNO' },
        { id: '6', name: 'MASTERSON' },
        { id: '7', name: 'AILTON' },
        { id: '8', name: 'SAMUEL' },
        { id: '9', name: 'PEDRO' },
        { id: '10', name: 'FELIPE' },
      ],
      schedules: [],
      currentSchedule: null,
      mode: 'view',

      setMode: (mode) => set({ mode }),

      addTechnician: (name) =>
        set((state) => ({
          technicians: [...state.technicians, { id: generateId(), name: name.toUpperCase() }],
        })),

      removeTechnician: (id) =>
        set((state) => ({
          technicians: state.technicians.filter((t) => t.id !== id),
        })),

      createSchedule: (date, shift) => {
        const newSchedule: Schedule = {
          id: generateId(),
          date,
          shift,
          boxes: Array.from({ length: 5 }, (_, i) => ({
            id: generateId(),
            number: i + 1,
            team: null,
            services: [],
          })),
        };
        set((state) => ({
          schedules: [...state.schedules, newSchedule],
          currentSchedule: newSchedule,
        }));
      },

      setCurrentSchedule: (schedule) => set({ currentSchedule: schedule }),

      deleteSchedule: (id) =>
        set((state) => ({
          schedules: state.schedules.filter((s) => s.id !== id),
          currentSchedule: state.currentSchedule?.id === id ? null : state.currentSchedule,
        })),

      addBox: (scheduleId) =>
        set((state) => {
          const schedules = state.schedules.map((s) => {
            if (s.id === scheduleId) {
              const maxNumber = Math.max(...s.boxes.map((b) => b.number), 0);
              return {
                ...s,
                boxes: [
                  ...s.boxes,
                  { id: generateId(), number: maxNumber + 1, team: null, services: [] },
                ],
              };
            }
            return s;
          });
          const currentSchedule = schedules.find((s) => s.id === scheduleId) || state.currentSchedule;
          return { schedules, currentSchedule };
        }),

      removeBox: (scheduleId, boxId) =>
        set((state) => {
          const schedules = state.schedules.map((s) => {
            if (s.id === scheduleId) {
              return { ...s, boxes: s.boxes.filter((b) => b.id !== boxId) };
            }
            return s;
          });
          const currentSchedule = schedules.find((s) => s.id === scheduleId) || state.currentSchedule;
          return { schedules, currentSchedule };
        }),

      updateBoxTeam: (scheduleId, boxId, team) =>
        set((state) => {
          const schedules = state.schedules.map((s) => {
            if (s.id === scheduleId) {
              return {
                ...s,
                boxes: s.boxes.map((b) => (b.id === boxId ? { ...b, team } : b)),
              };
            }
            return s;
          });
          const currentSchedule = schedules.find((s) => s.id === scheduleId) || state.currentSchedule;
          return { schedules, currentSchedule };
        }),

      updateBoxStatus: (scheduleId, boxId, status) =>
        set((state) => {
          const schedules = state.schedules.map((s) => {
            if (s.id === scheduleId) {
              return {
                ...s,
                boxes: s.boxes.map((b) => (b.id === boxId ? { ...b, status } : b)),
              };
            }
            return s;
          });
          const currentSchedule = schedules.find((s) => s.id === scheduleId) || state.currentSchedule;
          return { schedules, currentSchedule };
        }),

      addService: (scheduleId, boxId, service) =>
        set((state) => {
          const schedules = state.schedules.map((s) => {
            if (s.id === scheduleId) {
              return {
                ...s,
                boxes: s.boxes.map((b) =>
                  b.id === boxId
                    ? { ...b, services: [...b.services, { ...service, id: generateId() }] }
                    : b
                ),
              };
            }
            return s;
          });
          const currentSchedule = schedules.find((s) => s.id === scheduleId) || state.currentSchedule;
          return { schedules, currentSchedule };
        }),

      removeService: (scheduleId, boxId, serviceId) =>
        set((state) => {
          const schedules = state.schedules.map((s) => {
            if (s.id === scheduleId) {
              return {
                ...s,
                boxes: s.boxes.map((b) =>
                  b.id === boxId
                    ? { ...b, services: b.services.filter((srv) => srv.id !== serviceId) }
                    : b
                ),
              };
            }
            return s;
          });
          const currentSchedule = schedules.find((s) => s.id === scheduleId) || state.currentSchedule;
          return { schedules, currentSchedule };
        }),

      updateServiceStatus: (scheduleId, boxId, serviceId, status, completedAt) =>
        set((state) => {
          const schedules = state.schedules.map((s) => {
            if (s.id === scheduleId) {
              return {
                ...s,
                boxes: s.boxes.map((b) =>
                  b.id === boxId
                    ? {
                        ...b,
                        services: b.services.map((srv) =>
                          srv.id === serviceId ? { ...srv, status, completedAt } : srv
                        ),
                      }
                    : b
                ),
              };
            }
            return s;
          });
          const currentSchedule = schedules.find((s) => s.id === scheduleId) || state.currentSchedule;
          return { schedules, currentSchedule };
        }),
    }),
    {
      name: 'field-service-storage',
    }
  )
);
