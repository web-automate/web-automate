'use client';

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "../utils/api";

const buildUrlWithParams = (url: string, params: any) => {
  const regex = /{([a-zA-Z0-9_-]+)}/g;

  if (typeof params === 'string' || typeof params === 'number') {
    return url.replace(regex, String(params));
  }

  if (typeof params === 'object' && params !== null) {
    return url.replace(regex, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  }

  return url;
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

    Mutate: <TData, TVariables>(
      url: string,
      config?: { method?: 'POST' | 'PATCH' | 'DELETE' | 'PUT'; headers?: Record<string, string> },
      callbacks?: {
        onSuccess?: (data: TData) => void;
        onError?: (error: any) => void;
        invalidateKeys?: any[][];
      }
    ) => {
      return useMutation<TData, Error, TVariables>({
        mutationFn: (variables: any) => {
          const finalUrl = buildUrlWithParams(url, variables.id);
          let requestBody = variables.body;

          if (config?.method === 'DELETE') {
            if (typeof variables === 'string' || typeof variables === 'number') {
              requestBody = undefined;
            }
          }

          return fetcher(finalUrl, {
            method: config?.method || variables.method,
            body: requestBody,
            headers: {
              'Content-Type': 'application/json',
              ...config?.headers,
              'x-api-key': process.env.API_KEY || '',
            }
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
        onError: (error) => {
          callbacks?.onError?.(error);
        },
      });
    },

    MutateFile: <TData>(
      url: string,
      callbacks?: {
        onSuccess?: (data: TData) => void;
        onError?: (error: any) => void;
        invalidateKeys?: any[][];
      }
    ) => {
      return useMutation<TData, Error, { body: FormData; id?: string | Record<string, any> }>({
        mutationFn: (variables) => {
          const finalUrl = buildUrlWithParams(url, variables.id);

          return fetcher(finalUrl, {
            method: 'POST',
            body: variables.body,
            headers: {
              'x-api-key': process.env.API_KEY || '',
            }
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
        onError: (error) => {
          callbacks?.onError?.(error);
        },
      });
    }
  };
};