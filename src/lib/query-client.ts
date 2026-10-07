import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/lib/api";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // One retry smooths over flaky requests; auth errors are never retried.
        retry: (failureCount, error) =>
          !(isApiError(error) && error.status === 401) && failureCount < 1,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
