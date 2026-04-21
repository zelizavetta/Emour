import { get, post, patch, del } from './api.js';
import { ApiResponse } from '../types/api.js';
import { Note } from '../types/notes.js';


export async function apiCreateNote(
    title: string, 
    text: string, 
    createdAtClient: string,
    clientTimezone: string
  ): Promise<Note> {
  const response = await post<ApiResponse<Note>>('/api/notes', { title, text, createdAtClient, clientTimezone });
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

export async function apiUpdateNoteTitle(noteId: number, title: string): Promise<number> {
  const response = await patch<ApiResponse<number>>(`/api/notes/${noteId}`, { title });
  return response.data;
}

export async function apiUpdateNoteText(noteId: number, text: string): Promise<number> {
  const response = await patch<ApiResponse<number>>(`/api/notes/${noteId}`, { text });
  return response.data;
}