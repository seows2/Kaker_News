export const NEWS_URL = (currentPage: number) => `https://api.hnpwa.com/v0/news/${currentPage}.json`;
export const CONTENT_URL = (id: string) => `https://api.hnpwa.com/v0/item/${id}.json`;
