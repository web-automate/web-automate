type ApiOptions = {
  body?: any;
  headers?: Record<string, string>;
  method?: string;
};

export async function fetcher(url: string, options: ApiOptions = {}) {
  const isFormData = options.body instanceof FormData;

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      ...options.headers,
    },
    body: isFormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Something went wrong');
  }

  return res.json();
}