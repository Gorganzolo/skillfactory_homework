const API_KEY = process.env.API_KEY || '';
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

export async function fetchBooks(category, startIndex = 0, maxResults = 6) {
  const query = `"subject:${category}"`;
  const url = `${BASE_URL}?q=${encodeURIComponent(query)}&key=${API_KEY}&printType=books&startIndex=${startIndex}&maxResults=${maxResults}&langRestrict=en`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Failed to fetch books:', error);
    // Throw error so UI can handle it properly instead of failing silently
    throw error;
  }
}
