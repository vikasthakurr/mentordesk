/**
 * Client-side bookmark management using localStorage.
 * Key: mern-platform:bookmarks
 * Value: JSON array of topic slugs
 */

const BOOKMARKS_KEY = 'mern-platform:bookmarks';

export function getBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isBookmarked(topicSlug: string): boolean {
  return getBookmarks().includes(topicSlug);
}

export function addBookmark(topicSlug: string): void {
  const bookmarks = getBookmarks();
  if (!bookmarks.includes(topicSlug)) {
    bookmarks.push(topicSlug);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }
}

export function removeBookmark(topicSlug: string): void {
  const bookmarks = getBookmarks().filter((s) => s !== topicSlug);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

export function toggleBookmark(topicSlug: string): boolean {
  if (isBookmarked(topicSlug)) {
    removeBookmark(topicSlug);
    return false;
  } else {
    addBookmark(topicSlug);
    return true;
  }
}
