import axios from 'axios';
import type { Schedule, ScheduleCreateInput, ScheduleUpdateInput } from '../types/schedule.type';

const API_URL = 'http://localhost:5000/api/schedules';

export const scheduleApi = {
  getAll: async (): Promise<Schedule[]> => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  getById: async (id: string): Promise<Schedule> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (data: ScheduleCreateInput): Promise<Schedule> => {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  update: async (id: string, data: ScheduleUpdateInput): Promise<Schedule> => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};
