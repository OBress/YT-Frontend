var API_BASE_URL = 'https://96.40.94.118:3001';

if (import.meta.env.VITE_API_BASE_URL) {
    API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
}
  
console.log(API_BASE_URL);
export { API_BASE_URL };