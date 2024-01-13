import axios from 'axios'


const API = axios.create({ baseURL: 'http://localhost:5000' });

export const getAllRoom = (id, params) => API.get(`/room/${id}${params ? `?freeWord=${params}` : ''}`);

export const createRoom = (data) => API.post(`/room`, data);

export const updateRoom = (id, data) => API.patch(`/room/${id}`, data);

export const findRoom = (data) => API.put(`/room`, data);
