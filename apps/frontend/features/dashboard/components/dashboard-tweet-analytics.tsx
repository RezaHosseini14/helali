'use client';

import type { EChartsOption } from 'echarts';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

import {
  ChartEmptyState,
  DashboardChartPanel,
} from '@/features/dashboard/components/dashboard-chart-panel';
import { useTweetAnalytics } from '@/features/dashboard/hooks/use-dashboard-analytics';
import { useChartTheme } from '@/features/dashboard/hooks/use-chart-theme';
import { hexToRgba } from '@/lib/css-colors';
import { cn } from '@/lib/utils';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

const CHART_FONT_FAMILY = 'ERPyb, Tahoma, Arial, sans-serif';
const TWEET_CHART_COLORS = {
  likes: '#f43f5e',
  replies: '#0ea5e9',
  retweets: '#22c55e',
  quotes: '#f59e0b',
  tweets: '#8b5cf6',
  mediaVideo: '#ef4444',
  mediaImage: '#3b82f6',
  mediaText: '#14b8a6',
} as const;

function buildTooltip(theme: ReturnType<typeof useChartTheme>) {
  return {
    backgroundColor: theme.tooltipBg,
    borderColor: theme.tooltipBorder,
    borderWidth: 1,
    textStyle: { color: theme.foreground, fontSize: 12, fontFamily: CHART_FONT_FAMILY },
    extraCssText:
      'border-radius:14px;box-shadow:0 12px 32px rgba(15,110,97,0.12);padding:10px 14px;',
  };
}

function StatChip({
  label,
  value,
  toneClassName,
}: {
  readonly label: string;
  readonly value: string;
  readonly toneClassName: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn('mt-0.5 text-lg font-bold tabular-nums', toneClassName)}>{value}</p>
    </div>
  );
}

export function DashboardTweetAnalytics() {
  const theme = useChartTheme();
  const numberFormatter = useMemo(() => new Intl.NumberFormat('fa-IR'), []);
  const tweetsQuery = useTweetAnalytics();
  const data = tweetsQuery.data;
  const summary = data?.summary;
  const chartOpts = useMemo(() => ({ renderer: 'canvas' as const, locale: 'FA' }), []);

  const timeseriesPoints = useMemo(
    () =>
      (data?.timeseries ?? []).map((point) => ({
        ...point,
        label: point.date.slice(5).replace('-', '/'),
      })),
    [data?.timeseries],
  );

  const engagementOption = useMemo<EChartsOption>(() => {
    const items = data?.engagementBreakdown ?? [];
    const colors = [
      TWEET_CHART_COLORS.likes,
      TWEET_CHART_COLORS.replies,
      TWEET_CHART_COLORS.retweets,
      TWEET_CHART_COLORS.quotes,
    ];

    return {
      animationDuration: 900,
      animationEasing: 'cubicOut',
      textStyle: { fontFamily: CHART_FONT_FAMILY },
      tooltip: {
        ...buildTooltip(theme),
        trigger: 'item',
        formatter: (params: unknown) => {
          const item = params as { name?: string; value?: number; percent?: number; marker?: string };
          const value = typeof item.value === 'number' ? numberFormatter.format(item.value) : '۰';
          return `${item.marker ?? ''} ${item.name ?? ''}: <b>${value}</b> (${item.percent ?? 0}%)`;
        },
      },
      legend: {
        bottom: 0,
        left: 'center',
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: theme.mutedForeground, fontSize: 12, fontFamily: CHART_FONT_FAMILY },
      },
      series: [
        {
          type: 'pie',
          radius: ['48%', '72%'],
          center: ['50%', '44%'],
          padAngle: 3,
          itemStyle: {
            borderRadius: 8,
            borderColor: theme.card,
            borderWidth: 3,
          },
          label: { show: false },
          data: items.map((item, index) => ({
            name: item.label,
            value: item.value,
            itemStyle: { color: colors[index % colors.length] },
          })),
        },
      ],
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '36%',
          style: {
            text: numberFormatter.format(summary?.totalEngagement ?? 0),
            fill: theme.foreground,
            fontSize: 22,
            fontWeight: 700,
            fontFamily: CHART_FONT_FAMILY,
            align: 'center',
          },
        },
        {
          type: 'text',
          left: 'center',
          top: '48%',
          style: {
            text: 'کل تعامل',
            fill: theme.mutedForeground,
            fontSize: 12,
            fontFamily: CHART_FONT_FAMILY,
            align: 'center',
          },
        },
      ],
    };
  }, [data?.engagementBreakdown, numberFormatter, summary?.totalEngagement, theme]);

  const mediaMixOption = useMemo<EChartsOption>(() => {
    const items = data?.mediaMix ?? [];
    const colors = [
      TWEET_CHART_COLORS.mediaVideo,
      TWEET_CHART_COLORS.mediaImage,
      TWEET_CHART_COLORS.mediaText,
    ];

    return {
      animationDuration: 900,
      animationEasing: 'cubicOut',
      textStyle: { fontFamily: CHART_FONT_FAMILY },
      tooltip: {
        ...buildTooltip(theme),
        trigger: 'item',
      },
      legend: {
        bottom: 0,
        left: 'center',
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: theme.mutedForeground, fontSize: 12, fontFamily: CHART_FONT_FAMILY },
      },
      series: [
        {
          type: 'pie',
          radius: ['0%', '68%'],
          center: ['50%', '44%'],
          roseType: 'radius',
          itemStyle: {
            borderRadius: 6,
            borderColor: theme.card,
            borderWidth: 2,
          },
          label: {
            color: theme.mutedForeground,
            fontFamily: CHART_FONT_FAMILY,
            formatter: '{b}\n{d}%',
          },
          data: items
            .filter((item) => item.value > 0)
            .map((item, index) => ({
              name: item.label,
              value: item.value,
              itemStyle: { color: colors[index % colors.length] },
            })),
        },
      ],
    };
  }, [data?.mediaMix, theme]);

  const timeseriesOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 900,
      animationEasing: 'cubicOut',
      textStyle: { fontFamily: CHART_FONT_FAMILY },
      grid: { left: 8, right: 12, top: 48, bottom: 8, containLabel: true },
      legend: {
        top: 0,
        right: 0,
        icon: 'roundRect',
        itemWidth: 12,
        itemHeight: 8,
        textStyle: { color: theme.mutedForeground, fontSize: 11, fontFamily: CHART_FONT_FAMILY },
      },
      tooltip: {
        ...buildTooltip(theme),
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: timeseriesPoints.map((point) => point.label),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: theme.splitLine } },
        axisLabel: { color: theme.axisLabel, fontSize: 11, fontFamily: CHART_FONT_FAMILY },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: theme.splitLine, type: 'dashed' } },
        axisLabel: { color: theme.axisLabel, fontSize: 11, fontFamily: CHART_FONT_FAMILY },
      },
      series: [
        {
          name: 'توییت',
          type: 'line',
          smooth: 0.4,
          showSymbol: false,
          data: timeseriesPoints.map((point) => point.tweets),
          lineStyle: { width: 3, color: TWEET_CHART_COLORS.tweets },
          itemStyle: { color: TWEET_CHART_COLORS.tweets },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: hexToRgba(TWEET_CHART_COLORS.tweets, 0.28) },
                { offset: 1, color: hexToRgba(TWEET_CHART_COLORS.tweets, 0.02) },
              ],
            },
          },
        },
        {
          name: 'لایک',
          type: 'line',
          smooth: 0.4,
          showSymbol: false,
          data: timeseriesPoints.map((point) => point.likes),
          lineStyle: { width: 2.5, color: TWEET_CHART_COLORS.likes },
          itemStyle: { color: TWEET_CHART_COLORS.likes },
        },
        {
          name: 'ری‌توییت',
          type: 'line',
          smooth: 0.4,
          showSymbol: false,
          data: timeseriesPoints.map((point) => point.retweets),
          lineStyle: { width: 2.5, color: TWEET_CHART_COLORS.retweets },
          itemStyle: { color: TWEET_CHART_COLORS.retweets },
        },
        {
          name: 'پاسخ',
          type: 'line',
          smooth: 0.4,
          showSymbol: false,
          data: timeseriesPoints.map((point) => point.replies),
          lineStyle: { width: 2, color: TWEET_CHART_COLORS.replies },
          itemStyle: { color: TWEET_CHART_COLORS.replies },
        },
      ],
    }),
    [theme, timeseriesPoints],
  );

  const topEngagementOption = useMemo<EChartsOption>(() => {
    const items = [...(data?.topTweets ?? [])].reverse();

    return {
      animationDuration: 900,
      animationEasing: 'cubicOut',
      textStyle: { fontFamily: CHART_FONT_FAMILY },
      grid: { left: 8, right: 18, top: 8, bottom: 8, containLabel: true },
      tooltip: {
        ...buildTooltip(theme),
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: unknown) => {
          const entries = Array.isArray(params) ? params : [params];
          const first = entries[0] as { dataIndex?: number };
          const tweet = items[first.dataIndex ?? -1];
          if (!tweet) {
            return '';
          }

          return [
            `<div style="font-weight:600;margin-bottom:6px">${tweet.text}</div>`,
            `تعامل کل: <b>${numberFormatter.format(tweet.engagement)}</b>`,
            `لایک: <b>${numberFormatter.format(tweet.likeCount)}</b>`,
            `پاسخ: <b>${numberFormatter.format(tweet.replyCount)}</b>`,
            `ری‌توییت: <b>${numberFormatter.format(tweet.retweetCount)}</b>`,
            `نقل‌قول: <b>${numberFormatter.format(tweet.quoteCount)}</b>`,
          ].join('<br/>');
        },
      },
      legend: {
        show: false,
      },
      xAxis: {
        type: 'value',
        minInterval: 1,
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: theme.splitLine, type: 'dashed' } },
        axisLabel: { color: theme.axisLabel, fontSize: 10, fontFamily: CHART_FONT_FAMILY },
      },
      yAxis: {
        type: 'category',
        data: items.map((item) => (item.text.length > 22 ? `${item.text.slice(0, 22)}…` : item.text)),
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          color: theme.axisLabel,
          fontSize: 10,
          fontFamily: CHART_FONT_FAMILY,
          width: 96,
          overflow: 'truncate',
        },
      },
      series: [
        {
          name: 'لایک',
          type: 'bar',
          stack: 'engagement',
          barWidth: 14,
          data: items.map((item) => item.likeCount),
          itemStyle: { color: TWEET_CHART_COLORS.likes },
        },
        {
          name: 'پاسخ',
          type: 'bar',
          stack: 'engagement',
          data: items.map((item) => item.replyCount),
          itemStyle: { color: TWEET_CHART_COLORS.replies },
        },
        {
          name: 'ری‌توییت',
          type: 'bar',
          stack: 'engagement',
          data: items.map((item) => item.retweetCount),
          itemStyle: { color: TWEET_CHART_COLORS.retweets },
        },
        {
          name: 'نقل‌قول',
          type: 'bar',
          stack: 'engagement',
          data: items.map((item) => item.quoteCount),
          itemStyle: {
            color: TWEET_CHART_COLORS.quotes,
            borderRadius: [0, 8, 8, 0],
          },
        },
      ],
    };
  }, [data?.topTweets, numberFormatter, theme]);

  const hasTweets = (summary?.totalTweets ?? 0) > 0;

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold tracking-wide text-primary">تحلیل شبکه اجتماعی</p>
        <h2 className="mt-1 text-xl font-bold text-foreground">آنالیتیکس توییت‌ها</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          لایک، پاسخ، ری‌توییت، نقل‌قول، نوع رسانه و روند انتشار
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {[
          { label: 'کل توییت', value: summary?.totalTweets ?? 0, tone: 'text-foreground' },
          { label: 'منتشرشده', value: summary?.publishedCount ?? 0, tone: 'text-primary' },
          { label: 'تعامل کل', value: summary?.totalEngagement ?? 0, tone: 'text-[var(--brand-accent)]' },
          { label: 'لایک', value: summary?.totalLikes ?? 0, tone: 'text-primary' },
          { label: 'پاسخ', value: summary?.totalReplies ?? 0, tone: 'text-foreground' },
          { label: 'ری‌توییت', value: summary?.totalRetweets ?? 0, tone: 'text-[var(--brand-accent)]' },
          { label: 'نقل‌قول', value: summary?.totalQuotes ?? 0, tone: 'text-foreground' },
          { label: 'میانگین لایک', value: summary?.avgLikes ?? 0, tone: 'text-primary' },
        ].map((item) => (
          <StatChip
            key={item.label}
            label={item.label}
            value={numberFormatter.format(item.value)}
            toneClassName={item.tone}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <DashboardChartPanel
          title="ترکیب تعامل"
          description="سهم لایک، پاسخ، ری‌توییت و نقل‌قول"
          icon="solar:chart-bold-duotone"
          accentClassName="bg-primary"
          isLoading={tweetsQuery.isPending}
        >
          {!hasTweets ? (
            <ChartEmptyState message="هنوز توییتی برای تحلیل ثبت نشده است." />
          ) : (
            <ReactECharts
              option={engagementOption}
              style={{ height: '100%', width: '100%' }}
              opts={chartOpts}
              notMerge
            />
          )}
        </DashboardChartPanel>

        <DashboardChartPanel
          title="نوع رسانه توییت"
          description="ویدیو، تصویر یا فقط متن"
          icon="solar:gallery-wide-bold-duotone"
          accentClassName="bg-[var(--brand-accent)]"
          isLoading={tweetsQuery.isPending}
        >
          {!hasTweets ? (
            <ChartEmptyState message="داده‌ای برای ترکیب رسانه نیست." />
          ) : (
            <ReactECharts
              option={mediaMixOption}
              style={{ height: '100%', width: '100%' }}
              opts={chartOpts}
              notMerge
            />
          )}
        </DashboardChartPanel>

        <DashboardChartPanel
          title="روند انتشار و تعامل"
          description="تعداد توییت و متریک‌های روزانه"
          icon="solar:graph-new-bold-duotone"
          accentClassName="bg-[var(--chart-5)]"
          className="lg:col-span-2 xl:col-span-1"
          isLoading={tweetsQuery.isPending}
        >
          {timeseriesPoints.length === 0 ? (
            <ChartEmptyState message="در این بازه روندی ثبت نشده است." />
          ) : (
            <ReactECharts
              option={timeseriesOption}
              style={{ height: '100%', width: '100%' }}
              opts={chartOpts}
              notMerge
            />
          )}
        </DashboardChartPanel>
      </div>

      <DashboardChartPanel
        title="برترین توییت‌ها"
        description="رتبه‌بندی بر اساس مجموع لایک + پاسخ + ری‌توییت + نقل‌قول"
        icon="solar:ranking-bold-duotone"
        accentClassName="bg-amber-500"
        chartHeightClassName="h-[22rem] sm:h-[24rem]"
        isLoading={tweetsQuery.isPending}
      >
        {(data?.topTweets.length ?? 0) === 0 ? (
          <ChartEmptyState message="توییت برتری برای نمایش نیست." />
        ) : (
          <div className="grid h-full gap-4 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <ReactECharts
                option={topEngagementOption}
                style={{ height: '100%', width: '100%' }}
                opts={chartOpts}
                notMerge
              />
            </div>
            <div className="min-h-0 space-y-2 overflow-y-auto pe-1 xl:col-span-2">
              {data?.topTweets.map((tweet, index) => (
                <div
                  key={tweet.id}
                  className="rounded-xl border border-border/60 bg-background/50 px-3 py-2.5"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-semibold tabular-nums text-foreground">
                      {numberFormatter.format(tweet.engagement)} تعامل
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm text-foreground">{tweet.text}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    <span>{numberFormatter.format(tweet.likeCount)} لایک</span>
                    <span>{numberFormatter.format(tweet.replyCount)} پاسخ</span>
                    <span>{numberFormatter.format(tweet.retweetCount)} ری‌توییت</span>
                    <span>{numberFormatter.format(tweet.quoteCount)} نقل‌قول</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DashboardChartPanel>
    </section>
  );
}
