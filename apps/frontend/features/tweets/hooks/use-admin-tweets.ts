'use client';



import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import toast from 'react-hot-toast';



import { tweetKeys } from '@/features/tweets/hooks/tweet-keys';

import {

  getAdminTweets,

  setTweetPublished,

} from '@/features/tweets/services/tweets.service';

import { getApiErrorMessage } from '@/services/get-api-error-message';



export function useAdminTweets(page: number, limit: number) {

  return useQuery({

    queryKey: tweetKeys.adminList(page, limit),

    queryFn: () => getAdminTweets(page, limit),

  });

}



export function useTweetPublishedMutation(page: number, limit: number) {

  const queryClient = useQueryClient();



  return useMutation({

    mutationFn: ({ id, isPublished }: { id: number; isPublished: boolean }) =>

      setTweetPublished(id, isPublished),

    onSuccess: async (_data, variables) => {

      await Promise.all([

        queryClient.invalidateQueries({ queryKey: tweetKeys.adminLists() }),

        queryClient.invalidateQueries({ queryKey: tweetKeys.lists() }),

      ]);

      toast.success(

        variables.isPublished ? 'توییت برای نمایش فعال شد' : 'توییت از نمایش خارج شد',

      );

    },

    onError: (error) => {

      toast.error(getApiErrorMessage(error) || 'تغییر وضعیت نمایش انجام نشد');

    },

  });

}

