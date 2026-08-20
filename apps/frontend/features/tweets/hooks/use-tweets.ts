'use client';

import { useQuery } from '@tanstack/react-query';

import { tweetKeys } from '@/features/tweets/hooks/tweet-keys';
import { getTweets } from '@/features/tweets/services/tweets.service';

export { tweetKeys };

export function useTweets(limit = 10) {
  return useQuery({
    queryKey: tweetKeys.list(limit),
    queryFn: () => getTweets(limit),
  });
}
