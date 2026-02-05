import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
import { Technician, ServiceBox, Schedule, Service, Shift, Team, ServiceStatus, ServiceType, ServiceTypeCategory } from '@/types';

type AppMode = 'edit' | 'view';

interface AppState {
  technicians: Technician[];
  schedules: Schedule[];
  currentSchedule: Schedule | null;
  mode: AppMode;
  dbStatus: 'connected' | 'disconnected' | 'checking';

  // Mode
  setMode: (mode: AppMode) => void;

  fetchState: () => Promise<void>;
  checkDbStatus: () => Promise<void>;

  // Technicians
  addTechnician: (name: string) => void;
  removeTechnician: (id: string) => void;

  // Service Types (Categories)
  serviceTypes: ServiceTypeCategory[];
  addServiceType: (name: string) => void;
  removeServiceType: (id: string) => void;

  // Schedules
  createSchedule: (date: string, shift: Shift) => void;
  setCurrentSchedule: (schedule: Schedule | null) => void;
  deleteSchedule: (id: string) => void;
  updateScheduleNotes: (id: string, notes: string) => void;

  // Boxes
  addBox: (scheduleId: string) => void;
  removeBox: (scheduleId: string, boxId: string) => void;
  updateBoxTeam: (scheduleId: string, boxId: string, team: Team | null) => void;
  updateBoxStatus: (scheduleId: string, boxId: string, status: string) => void;
  updateBoxDepartureTime: (scheduleId: string, boxId: string, departureTime: string) => void;
  updateBoxReturnTime: (scheduleId: string, boxId: string, returnTime: string) => void;
  updateBoxNumber: (scheduleId: string, boxId: string, newNumber: number) => void;
  updateBoxAlert: (scheduleId: string, boxId: string, alert: string) => void;

  // Services

  addService: (scheduleId: string, boxId: string, service: Omit<Service, 'id'>) => Promise<void>;
  removeService: (scheduleId: string, boxId: string, serviceId: string) => Promise<void>;
  updateServiceStatus: (scheduleId: string, boxId: string, serviceId: string, status: ServiceStatus, completedAt: string) => Promise<void>;
  updateServiceType: (scheduleId: string, boxId: string, serviceId: string, type: string) => Promise<void>;
  moveService: (scheduleId: string, fromBoxId: string, toBoxId: string, serviceId: string) => Promise<void>;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useAppStore = create<AppState>()(
  (set, get) => ({
    technicians: [],
    schedules: [],
    serviceTypes: [],
    currentSchedule: null,
    mode: 'view',
    dbStatus: 'checking',

    setMode: (mode) => set({ mode }),

    checkDbStatus: async () => {
      try {
        const res = await fetch('/health');
        const data = await res.json();
        set({ dbStatus: data.database === 'connected' ? 'connected' : 'disconnected' });
      } catch (err) {
        set({ dbStatus: 'disconnected' });
      }
    },

    // Initial Load & Polling
    fetchState: async () => {
      try {
        const res = await fetch('/api/state');
        const data = await res.json();

        const newSchedules = data.schedules.map((s: any) => ({
          ...s,
          boxes: s.boxes.map((b: any) => ({
            ...b,
            services: b.services || []
          }))
        })) || [];

        set((state) => {
          // If we have a current schedule, try to find its updated version
          let updatedCurrentSchedule = state.currentSchedule;
          if (state.currentSchedule) {
            updatedCurrentSchedule = newSchedules.find((s: any) => s.id === state.currentSchedule?.id) || null;
          }

          return {
            technicians: data.technicians || [],
            serviceTypes: data.serviceTypes || state.serviceTypes,
            schedules: newSchedules,
            currentSchedule: updatedCurrentSchedule
          };
        });
      } catch (err) {
        console.error('Failed to fetch state', err);
      }
    },

    addTechnician: async (name) => {
      const id = generateId();
      // Optimistic
      set((state) => ({ technicians: [...state.technicians, { id, name: name.toUpperCase() }] }));
      // Sync
      fetch('/api/technicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: name.toUpperCase() })
      });
    },

    removeTechnician: async (id) => {
      set((state) => ({ technicians: state.technicians.filter((t) => t.id !== id) }));
      fetch(`/api/technicians/${id}`, { method: 'DELETE' });
    },

    addServiceType: async (name) => {
      const id = generateId();
      const upperName = name.toUpperCase();
      set((state) => ({ serviceTypes: [...state.serviceTypes, { id, name: upperName }] }));
      fetch('/api/service-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: upperName })
      });
    },

    removeServiceType: async (id) => {
      set((state) => ({ serviceTypes: state.serviceTypes.filter((t) => t.id !== id) }));
      fetch(`/api/service-types/${id}`, { method: 'DELETE' });
    },

    createSchedule: async (date, shift) => {
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

      // Optimistic Update
      set((state) => ({
        schedules: [newSchedule, ...state.schedules], // Add to top since backend sorts by date desc
        currentSchedule: newSchedule,
      }));

      // Sync
      try {
        await fetch('/api/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSchedule)
        });
        // In a real app, we might reload state here to get "clean" data or IDs if DB generated them
      } catch (e) {
        console.error('Failed to save schedule');
        // Rollback?
      }
    },

    setCurrentSchedule: (schedule) => set({ currentSchedule: schedule }),

    deleteSchedule: async (id) => {
      set((state) => ({
        schedules: state.schedules.filter((s) => s.id !== id),
        currentSchedule: state.currentSchedule?.id === id ? null : state.currentSchedule,
      }));
      fetch(`/api/schedules/${id}`, { method: 'DELETE' });
    },

    updateScheduleNotes: async (id, notes) => {
      set((state) => {
        const schedules = state.schedules.map((s) => (s.id === id ? { ...s, notes } : s));
        const currentSchedule = schedules.find((s) => s.id === id) || state.currentSchedule;
        return { schedules, currentSchedule };
      });
      fetch(`/api/schedules/${id}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
    },

    addBox: async (scheduleId) => {
      let newBox: any;
      set((state) => {
        const schedules = state.schedules.map((s) => {
          if (s.id === scheduleId) {
            const maxNumber = Math.max(...s.boxes.map((b) => b.number), 0);
            newBox = { id: generateId(), number: maxNumber + 1, team: null, services: [] };
            return {
              ...s,
              boxes: [...s.boxes, newBox],
            };
          }
          return s;
        });
        const currentSchedule = schedules.find((s) => s.id === scheduleId) || state.currentSchedule;
        // Sync
        if (newBox) {
          fetch('/api/boxes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scheduleId, box: newBox })
          });
        }
        return { schedules, currentSchedule };
      });
    },

    removeBox: async (scheduleId, boxId) => {
      set((state) => {
        const schedules = state.schedules.map((s) => {
          if (s.id === scheduleId) {
            return { ...s, boxes: s.boxes.filter((b) => b.id !== boxId) };
          }
          return s;
        });
        const currentSchedule = schedules.find((s) => s.id === scheduleId) || state.currentSchedule;
        return { schedules, currentSchedule };
      });
      fetch(`/api/boxes/${boxId}`, { method: 'DELETE' });
    },

    updateBoxTeam: async (scheduleId, boxId, team) => {
      set((state) => {
        // ... existing logic ...
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

        // Sync Box (Full update or partial?)
        // Since our API has PUT /api/boxes/:id, we can just send the updated fields
        fetch(`/api/boxes/${boxId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ team })
        });

        return { schedules, currentSchedule };
      });
    },

    updateBoxStatus: async (scheduleId, boxId, status) => {
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

        fetch(`/api/boxes/${boxId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });

        return { schedules, currentSchedule };
      });
    },

    updateBoxDepartureTime: async (scheduleId, boxId, departureTime) => {
      set((state) => {
        const schedules = state.schedules.map((s) => {
          if (s.id === scheduleId) {
            return {
              ...s,
              boxes: s.boxes.map((b) => (b.id === boxId ? { ...b, departureTime } : b)),
            };
          }
          return s;
        });
        const currentSchedule = schedules.find((s) => s.id === scheduleId) || state.currentSchedule;

        fetch(`/api/boxes/${boxId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ departureTime })
        });

        return { schedules, currentSchedule };
      });
    },

    updateBoxReturnTime: async (scheduleId, boxId, returnTime) => {
      set((state) => {
        const schedules = state.schedules.map((s) => {
          if (s.id === scheduleId) {
            return {
              ...s,
              boxes: s.boxes.map((b) => (b.id === boxId ? { ...b, returnTime } : b)),
            };
          }
          return s;
        });
        const currentSchedule = schedules.find((s) => s.id === scheduleId) || state.currentSchedule;

        fetch(`/api/boxes/${boxId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ returnTime })
        });

        return { schedules, currentSchedule };
      });
    },

    updateBoxNumber: async (scheduleId, boxId, newNumber) => {
      set((state) => {
        const schedules = state.schedules.map((s) => {
          if (s.id === scheduleId) {
            const updatedBoxes = s.boxes.map((b) =>
              b.id === boxId ? { ...b, number: newNumber } : b
            );
            // Sort boxes by number ascending
            updatedBoxes.sort((a, b) => a.number - b.number);

            return {
              ...s,
              boxes: updatedBoxes,
            };
          }
          return s;
        });
        const currentSchedule = schedules.find((s) => s.id === scheduleId) || state.currentSchedule;

        fetch(`/api/boxes/${boxId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number: newNumber }),
        });

        return { schedules, currentSchedule };
      });
    },

    addService: async (scheduleId, boxId, service) => {
      const newService = { ...service, id: generateId() };
      set((state) => {
        const schedules = state.schedules.map((s) => {
          if (s.id === scheduleId) {
            return {
              ...s,
              boxes: s.boxes.map((b) =>
                b.id === boxId
                  ? { ...b, services: [...b.services, newService] }
                  : b
              ),
            };
          }
          return s;
        });
        const currentSchedule = schedules.find((s) => s.id === scheduleId) || state.currentSchedule;

        fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ boxId, service: newService })
        });

        return { schedules, currentSchedule };
      });
    },

    removeService: async (scheduleId, boxId, serviceId) => {
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

        fetch(`/api/services/${serviceId}`, { method: 'DELETE' });

        return { schedules, currentSchedule };
      });
    },

    updateServiceStatus: async (scheduleId, boxId, serviceId, status, completedAt) => {
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

        fetch(`/api/services/${serviceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, completedAt })
        });

        return { schedules, currentSchedule };
      });
    },

    updateServiceType: async (scheduleId, boxId, serviceId, type) => {
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
                      srv.id === serviceId ? { ...srv, type: type as ServiceType } : srv
                    ),
                  }
                  : b
              ),
            };
          }
          return s;
        });
        const currentSchedule = schedules.find((s) => s.id === scheduleId) || state.currentSchedule;

        fetch(`/api/services/${serviceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type })
        });

        return { schedules, currentSchedule };
      });
    },

    moveService: async (scheduleId, fromBoxId, toBoxId, serviceId) => {
      set((state) => {
        // ... logic ...
        const schedules = state.schedules.map((s) => {
          if (s.id === scheduleId) {
            const fromBox = s.boxes.find((b) => b.id === fromBoxId);
            const service = fromBox?.services.find((srv) => srv.id === serviceId);

            if (!service) return s;

            return {
              ...s,
              boxes: s.boxes.map((b) => {
                if (b.id === fromBoxId) {
                  return {
                    ...b,
                    services: b.services.filter((srv) => srv.id !== serviceId),
                  };
                }
                if (b.id === toBoxId) {
                  return {
                    ...b,
                    services: [...b.services, service],
                  };
                }
                return b;
              }),
            };
          }
          return s;
        });
        const currentSchedule = schedules.find((s) => s.id === scheduleId) || state.currentSchedule;

        fetch('/api/services/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serviceId, toBoxId })
        });

        return { schedules, currentSchedule };
      });
    },
  })
);
