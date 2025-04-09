import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

interface ExtendedRequestInit extends RequestInit {
  url?: string;
}

export async function apiRequest<T = Response>(
  urlOrOptions: string | ExtendedRequestInit,
  options?: ExtendedRequestInit,
): Promise<T> {
  let url: string;
  let requestOptions: RequestInit;
  
  if (typeof urlOrOptions === 'string') {
    url = urlOrOptions;
    requestOptions = options || {};
  } else {
    url = urlOrOptions.url || '';
    requestOptions = urlOrOptions;
  }
  
  const res = await fetch(url, {
    ...requestOptions,
    headers: {
      ...(requestOptions.headers || {}),
    },
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // Check if we should return JSON
  if ((res.headers.get('content-type') || '').includes('application/json')) {
    return res.json();
  }
  
  return res as unknown as T;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    if (!res.ok) {
      // Try to parse the error response as JSON
      try {
        const errorData = await res.json();
        const error = new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
        (error as any).response = { status: res.status, data: errorData };
        throw error;
      } catch (e) {
        // If we can't parse JSON, throw the original error
        await throwIfResNotOk(res);
      }
    }
    
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
