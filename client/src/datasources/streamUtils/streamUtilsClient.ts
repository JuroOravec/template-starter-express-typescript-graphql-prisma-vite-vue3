/**
 * Client that sends requests to the Google Cloud Functions endpoints
 * of the Stream Utils project
 */
const createStreamUtilsClient = () => {
  const baseUrl = 'https://us-central1-twitch-stream-387b9.cloudfunctions.net/';
  // Use for local dev
  // const baseUrl = 'http://localhost:5001/twitch-stream-387b9/us-central1/';

  const fetchEndpoint = async <T = any>(endpoint: string, options?: RequestInit): Promise<T> => {
    const res = await fetch(`${baseUrl}${endpoint}`, options);
    return await res.json();
  };

  const get = <T = any>(endpoint: string, options?: RequestInit): Promise<T> => 
    fetchEndpoint(endpoint, { ...options, method: 'GET'})

  const post = <T = any>(endpoint: string, options?: RequestInit): Promise<T> => 
    fetchEndpoint(endpoint, { ...options, method: 'POST'})

  return {
    fetch: fetchEndpoint,
    get,
    post,
  };
};

export const streamUtilsClient = createStreamUtilsClient();
