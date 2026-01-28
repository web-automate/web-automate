// hooks/use-client-api.ts
'use client';

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "../utils/api";

export const useClientApi = () => {
  const queryClient = useQueryClient();

  return {
    Get: <T>(url: string, key: any[], options?: { enabled?: boolean }) => {
      return useQuery<T>({
        queryKey: key,
        queryFn: () => fetcher(url),
        ...options,
      });
    },

    Mutate: <TData, TVariables>(
      url: string,
      config: { method: 'POST' | 'PATCH' | 'DELETE'; headers?: Record<string, string> },
      callbacks?: {
        onSuccess?: (data: TData) => void;
        onError?: (error: any) => void;
        invalidateKeys?: any[][];
      }
    ) => {
      return useMutation<TData, Error, TVariables>({
        mutationFn: (variables: any) => {
          let finalUrl = url;

          if (config.method === 'DELETE') {
            const id = typeof variables === 'string' ? variables : variables?.id;
            if (id) {
              finalUrl = `${url}/${id}`;
            }
          }

          return fetcher(finalUrl, {
            method: config.method,
            body: config.method === 'DELETE' ? undefined : variables,
            headers: config.headers
          });
        },
        onSuccess: (data) => {
          if (callbacks?.invalidateKeys) {
            callbacks.invalidateKeys.forEach(key =>
              queryClient.invalidateQueries({ queryKey: key })
            );
          }
          callbacks?.onSuccess?.(data);
        },
        onError: callbacks?.onError,
      });
    }
  };
};