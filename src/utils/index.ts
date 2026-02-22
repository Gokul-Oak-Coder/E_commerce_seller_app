import { STORAGE_URL } from '../constants';

export const getImageUrl = (path: string | null): string | null => {
    if (!path) return null;
    if (path.startsWith('http')) return path; // already full URL
    return `${STORAGE_URL}/${path}`;
};