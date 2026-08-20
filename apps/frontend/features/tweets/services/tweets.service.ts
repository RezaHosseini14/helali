import type { IPaginatedResponse, ITweet } from '@helali/shared';



import { apiClient, unwrapApiResponse } from '@/services/api-client';



export async function getTweets(limit = 10): Promise<ReadonlyArray<ITweet>> {

  return unwrapApiResponse(apiClient.get('/tweets', { params: { limit } }));

}



export async function getAdminTweets(

  page = 1,

  limit = 10,

): Promise<IPaginatedResponse<ITweet>> {

  return unwrapApiResponse(apiClient.get('/tweets/admin', { params: { page, limit } }));

}



export async function setTweetPublished(id: number, isPublished: boolean): Promise<ITweet> {

  return unwrapApiResponse(apiClient.patch(`/tweets/${id}/published`, { isPublished }));

}

