import { get, post, patch, del } from './api.js';
import { ApiResponse } from '../types/api.js';
import { Note, EmotionType } from '../types/notes.js';


export async function apiCreateNote(
    title: string,
    text: string,
    emotion: EmotionType,
    createdAtClient: string,
    clientTimezone: string
  ): Promise<Note> {
  const response = await post<ApiResponse<Note>>('/api/notes', { title, text, emotion, createdAtClient, clientTimezone });
  return response.data;
}

export async function apiGetAllNotes(): Promise<Note[]> {
  const response = await get<ApiResponse<Note[]>>('/api/notes/all');
  return response.data;
}

export async function apiGetNoteById(noteId: number): Promise<Note> {
  const response = await get<ApiResponse<Note>>(`/api/notes/${noteId}`);
  return response.data;
}

export async function apiUpdateNote(
    noteId: number,
    title: string,
    text: string,
    emotion: EmotionType,
    createdAtClient: string,
    clientTimezone: string
  ): Promise<Note> {
  const response = await patch<ApiResponse<Note>>(`/api/notes/${noteId}`, { title, text, emotion, createdAtClient, clientTimezone });
  return response.data;
}

export async function apiDeleteNote(noteId: number): Promise<void> {
  await del(`/api/notes/${noteId}`);
}
