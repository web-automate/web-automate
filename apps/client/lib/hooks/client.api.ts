'use client';

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "../utils/api";

const buildUrlWithParams = (url: string, params?: Record<string, string | number>) => {
  if (!params) return url;
  
  return url.replace(/{([a-zA-Z0-9_-]+)}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
};

type MutateConfig = {
  method?: 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  headers?: Record<string, string>;
};

type MutateCallbacks<TData> = {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  invalidateKeys?: any[][];
};

type MutationVariables<TBody> = {
  params?: Record<string, string | number>;
  method?: 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  body?: TBody;
};

export const useClientApi = () => {
  const queryClient = useQueryClient();

  return {
    Get: <T>(url: string, key: any[], options?: any) => {
      return useQuery<T>({
        queryKey: key,
        queryFn: () => fetcher(url),
        ...options,
      });
    },

    Mutate: <TData, TBody = unknown>(
      url: string,
      config?: MutateConfig,
      callbacks?: MutateCallbacks<TData>
    ) => {
      return useMutation<TData, Error, MutationVariables<TBody>>({
        mutationFn: async ({ params, method, body }) => {
          const finalUrl = buildUrlWithParams(url, params);

          return fetcher(finalUrl, {
            method: method || config?.method || 'POST',
            body: body,
            headers: {
              'Content-Type': 'application/json',
              ...config?.headers,
              'x-api-key': process.env.API_KEY || '',
            },
          });
        },
        onSuccess: (data) => {
          if (callbacks?.invalidateKeys) {
            callbacks.invalidateKeys.forEach((key) =>
              queryClient.invalidateQueries({ queryKey: key })
            );
          }
          callbacks?.onSuccess?.(data);
        },
        onError: (error) => {
          callbacks?.onError?.(error);
        },
      });
    },

    MutateFile: <TData>(
      url: string,
      callbacks?: MutateCallbacks<TData>
    ) => {
      return useMutation<TData, Error, { body: FormData; params?: Record<string, string | number> }>({
        mutationFn: async ({ params, body }) => {
          const finalUrl = buildUrlWithParams(url, params);

          return fetcher(finalUrl, {
            method: 'POST',
            body: body,
            headers: {
              'x-api-key': process.env.API_KEY || '',
            },
          });
        },
        onSuccess: (data) => {
          if (callbacks?.invalidateKeys) {
            callbacks.invalidateKeys.forEach((key) =>
              queryClient.invalidateQueries({ queryKey: key })
            );
          }
          callbacks?.onSuccess?.(data);
        },
        onError: (error) => {
          callbacks?.onError?.(error);
        },
      });
    },
  };
};