/** A file from public/ (e.g. '/images/hero.jpg') under the deploy base: '/' locally, '/familymenu-ai/' on GitHub Pages. */
export const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '')
