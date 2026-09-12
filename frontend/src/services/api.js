import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const client = axios.create({ baseURL: API_BASE });

export const listSessions = () => client.get("/sessions").then((r) => r.data);

export const createSession = (title) =>
  client.post("/sessions", { title }).then((r) => r.data);

export const getSession = (sessionId) =>
  client.get(`/sessions/${sessionId}`).then((r) => r.data);

export const deleteSession = (sessionId) =>
  client.delete(`/sessions/${sessionId}`).then((r) => r.data);

export const renameSession = (sessionId, title) =>
  client.patch(`/sessions/${sessionId}/rename`, { title }).then((r) => r.data);
