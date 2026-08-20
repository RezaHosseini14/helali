'use client';

import { Icon } from '@iconify/react';
import type { EChartsOption } from 'echarts';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

import {
  ChartEmptyState,
  DashboardChartPanel,
} from '@/features/dashboard/components/dashboard-chart-panel';
import { DashboardTweetAnalytics } from '@/features/dashboard/components/dashboard-tweet-analytics';
import {
  useAnalyticsByCategory,
  useAnalyticsTimeseries,
  useAnalyticsTop,
} from '@/features/dashboard/hooks/use-dashboard-analytics';
import { useChartTheme } from '@/features/dashboard/hooks/use-chart-theme';
import { hexToRgba } from '@/lib/css-colors';
import { cn } from '@/lib/utils';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

type MediaFilter = 'all' | 'audio' | 'video' | 'gallery';

interface ITooltipAxisParams {
  readonly axisValue?: string;
  readonly seriesName?: string;
  readonly value?: number;
  readonly marker?: string;
}

interface ITooltipItemParams {
  readonly dataIndex: number;
}

const ENTITY_LABELS: Record<string, string> = {
  audio: 'صوت',
  video: 'ویدیو',
  gallery: 'گالری',
  all: 'همه',
};

const FILTER_ICONS: Record<MediaFilter, string> = {
  all: 'solar:chart-square-bold-duotone',
  audio: 'solar:music-notes-bold-duotone',
  video: 'solar:videocamera-record-bold-duotone',
  gallery: 'solar:gallery-minimalistic-bold-duotone',
};

const RANK_ACCENTS = ['bg-amber-500', 'bg-slate-400', 'bg-orange-600'];
const CHART_FONT_FAMILY = 'ERPyb, Tahoma, Arial, sans-serif';
const CHART_COLORS = {
  views: '#2563eb',
  likes: '#ec4899',
  engagementStart: '#7c3aed',
  engagementTop: '#14b8a6',
  engagementRest: '#f97316',
  barViewsStart: '#3b82f6',
  barViewsEnd: '#1d4ed8',
  barLikesStart: '#f43f5e',
  barLikesEnd: '#be123c',
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

function buildAxisStyle(theme: ReturnType<typeof useChartTheme>) {
  return {
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: { color: theme.axisLabel, fontSize: 11 },
    splitLine: {
      lineStyle: { color: theme.splitLine, type: 'dashed' as const },
    },
  };
}

function FilterPills<T extends string>({
  value,
  options,
  onChange,
}: {
  readonly value: T;
  readonly options: ReadonlyArray<{ value: T; label: string; icon?: string }>;
  readonly onChange: (next: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full border border-border/70 bg-muted/40 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
            value === option.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-background/80 hover:text-foreground',
          )}
        >
          {option.icon ? <Icon icon={option.icon} className="text-sm" /> : null}
          {option.label}
        </button>
      ))}
    </div>
  );
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

export function DashboardAnalytics() {
  const theme = useChartTheme();
  const numberFormatter = useMemo(() => new Intl.NumberFormat('fa-IR'), []);
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');
  const [categoryKind, setCategoryKind] = useState<'audio' | 'video'>('audio');

  const timeseriesQuery = useAnalyticsTimeseries(mediaFilter);
  const topQuery = useAnalyticsTop(mediaFilter, 'views');
  const categoryQuery = useAnalyticsByCategory(categoryKind);

  const chartPoints = useMemo(
    () =>
      (timeseriesQuery.data?.points ?? []).map((point) => ({
        ...point,
        label: point.date.slice(5).replace('-', '/'),
      })),
    [timeseriesQuery.data?.points],
  );

  const categoryBars = useMemo(
    () =>
      (categoryQuery.data?.categories ?? []).map((item) => ({
        name: item.categoryTitle,
        views: item.views,
        likes: item.likes,
      })),
    [categoryQuery.data?.categories],
  );

  const engagementAnalysis = useMemo(
    () =>
      (topQuery.data?.items ?? [])
        .slice(0, 8)
        .map((item) => {
          const safeViews = Math.max(item.views, 1);
          const engagementRate = Number(((item.likes / safeViews) * 100).toFixed(1));

          return {
            title: item.title,
            engagementRate,
            views: item.views,
            likes: item.likes,
          };
        })
        .sort((a, b) => b.engagementRate - a.engagementRate),
    [topQuery.data?.items],
  );

  const periodStats = useMemo(() => {
    const totalViews = chartPoints.reduce((sum, point) => sum + point.views, 0);
    const totalLikes = chartPoints.reduce((sum, point) => sum + point.likes, 0);
    const avgEngagement =
      totalViews > 0 ? Number(((totalLikes / totalViews) * 100).toFixed(1)) : 0;

    return { totalViews, totalLikes, avgEngagement };
  }, [chartPoints]);

  const maxTopViews = useMemo(
    () => Math.max(...(topQuery.data?.items.map((item) => item.views) ?? [1]), 1),
    [topQuery.data?.items],
  );

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
        itemGap: 16,
        textStyle: { color: theme.mutedForeground, fontSize: 12 },
      },
      tooltip: {
        ...buildTooltip(theme),
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: { color: hexToRgba(CHART_COLORS.views, 0.35) },
          lineStyle: { color: hexToRgba(CHART_COLORS.views, 0.25), type: 'dashed' },
        },
        formatter: (params: unknown) => {
          const items = Array.isArray(params) ? params : [params];
          const first = items[0] as ITooltipAxisParams;
          const lines = items.map((entry) => {
            const item = entry as ITooltipAxisParams;
            const value =
              typeof item.value === 'number' ? numberFormatter.format(item.value) : '۰';
            return `${item.marker ?? ''} ${item.seriesName ?? ''}: <b>${value}</b>`;
          });

          return [`<div style="font-weight:600;margin-bottom:4px">${first.axisValue ?? ''}</div>`, ...lines].join(
            '<br/>',
          );
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: chartPoints.map((point) => point.label),
        ...buildAxisStyle(theme),
        axisLine: { show: true, lineStyle: { color: theme.splitLine } },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        ...buildAxisStyle(theme),
      },
      series: [
        {
          name: 'بازدید',
          type: 'line',
          smooth: 0.45,
          symbol: 'circle',
          symbolSize: 8,
          showSymbol: chartPoints.length <= 14,
          lineStyle: {
            width: 3,
            color: CHART_COLORS.views,
            shadowBlur: 8,
            shadowColor: hexToRgba(CHART_COLORS.views, 0.35),
          },
          itemStyle: {
            color: theme.card,
            borderColor: CHART_COLORS.views,
            borderWidth: 2,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: hexToRgba(CHART_COLORS.views, 0.32) },
                { offset: 1, color: hexToRgba(CHART_COLORS.views, 0.02) },
              ],
            },
          },
          emphasis: { focus: 'series' },
          data: chartPoints.map((point) => point.views),
        },
        {
          name: 'لایک',
          type: 'line',
          smooth: 0.45,
          symbol: 'circle',
          symbolSize: 7,
          showSymbol: chartPoints.length <= 14,
          lineStyle: { width: 2.5, color: CHART_COLORS.likes },
          itemStyle: {
            color: theme.card,
            borderColor: CHART_COLORS.likes,
            borderWidth: 2,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: hexToRgba(CHART_COLORS.likes, 0.24) },
                { offset: 1, color: hexToRgba(CHART_COLORS.likes, 0.01) },
              ],
            },
          },
          emphasis: { focus: 'series' },
          data: chartPoints.map((point) => point.likes),
        },
      ],
    }),
    [chartPoints, numberFormatter, theme],
  );

  const categoryOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 900,
      animationEasing: 'cubicOut',
      animationDelay: (index: number) => index * 60,
      textStyle: { fontFamily: CHART_FONT_FAMILY },
      grid: { left: 8, right: 12, top: 48, bottom: 8, containLabel: true },
      legend: {
        top: 0,
        right: 0,
        icon: 'roundRect',
        itemWidth: 12,
        itemHeight: 8,
        textStyle: { color: theme.mutedForeground, fontSize: 12 },
      },
      tooltip: {
        ...buildTooltip(theme),
        trigger: 'axis',
        axisPointer: { type: 'shadow', shadowStyle: { color: hexToRgba(CHART_COLORS.views, 0.08) } },
      },
      xAxis: {
        type: 'category',
        data: categoryBars.map((item) => item.name),
        axisLabel: { color: theme.axisLabel, fontSize: 10, rotate: categoryBars.length > 4 ? 22 : 0 },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: theme.splitLine } },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        ...buildAxisStyle(theme),
      },
      series: [
        {
          name: 'بازدید',
          type: 'bar',
          barMaxWidth: 28,
          data: categoryBars.map((item) => item.views),
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: CHART_COLORS.barViewsStart },
                { offset: 1, color: CHART_COLORS.barViewsEnd },
              ],
            },
            shadowBlur: 10,
            shadowColor: hexToRgba(CHART_COLORS.barViewsStart, 0.25),
          },
        },
        {
          name: 'لایک',
          type: 'bar',
          barMaxWidth: 28,
          data: categoryBars.map((item) => item.likes),
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: CHART_COLORS.barLikesStart },
                { offset: 1, color: CHART_COLORS.barLikesEnd },
              ],
            },
            shadowBlur: 10,
            shadowColor: hexToRgba(CHART_COLORS.barLikesStart, 0.2),
          },
        },
      ],
    }),
    [categoryBars, theme],
  );

  const engagementOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 900,
      animationEasing: 'cubicOut',
      animationDelay: (index: number) => index * 70,
      textStyle: { fontFamily: CHART_FONT_FAMILY },
      grid: { left: 8, right: 24, top: 12, bottom: 8, containLabel: true },
      tooltip: {
        ...buildTooltip(theme),
        trigger: 'item',
        formatter: (params: unknown) => {
          const { dataIndex } = params as ITooltipItemParams;
          const item = engagementAnalysis[dataIndex];
          if (!item) {
            return '';
          }

          return [
            `<div style="font-weight:600;margin-bottom:6px">${item.title}</div>`,
            `نرخ تعامل: <b>${item.engagementRate}%</b>`,
            `بازدید: <b>${numberFormatter.format(item.views)}</b>`,
            `لایک: <b>${numberFormatter.format(item.likes)}</b>`,
          ].join('<br/>');
        },
      },
      xAxis: {
        type: 'value',
        max: (value) => Math.max(value.max * 1.15, 5),
        ...buildAxisStyle(theme),
        axisLabel: { color: theme.axisLabel, formatter: '{value}%' },
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: engagementAnalysis.map((item) =>
          item.title.length > 18 ? `${item.title.slice(0, 18)}…` : item.title,
        ),
        axisLabel: {
          color: theme.axisLabel,
          fontSize: 10,
          width: 88,
          overflow: 'truncate',
        },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [
        {
          name: 'نرخ تعامل',
          type: 'bar',
          barWidth: 16,
          data: engagementAnalysis.map((item, index) => ({
            value: item.engagementRate,
            itemStyle: {
              borderRadius: [0, 10, 10, 0],
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: hexToRgba(CHART_COLORS.engagementStart, 0.85) },
                  { offset: 1, color: index < 3 ? CHART_COLORS.engagementTop : CHART_COLORS.engagementRest },
                ],
              },
              shadowBlur: 8,
              shadowColor: hexToRgba(CHART_COLORS.engagementTop, 0.2),
            },
          })),
          label: {
            show: true,
            position: 'right',
            formatter: '{c}%',
            color: theme.mutedForeground,
            fontSize: 11,
          },
        },
      ],
    }),
    [engagementAnalysis, numberFormatter, theme],
  );

  const chartOpts = useMemo(() => ({ renderer: 'canvas' as const, locale: 'FA' }), []);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-primary">گزارش عملکرد</p>
          <h2 className="mt-1 text-xl font-bold text-foreground">آنالیتیکس محتوا</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            روند بازدید، لایک و تعامل محتوا در ۷ روز اخیر
          </p>
        </div>
        <FilterPills<MediaFilter>
          value={mediaFilter}
          onChange={setMediaFilter}
          options={(['all', 'audio', 'video', 'gallery'] as const).map((value) => ({
            value,
            label: ENTITY_LABELS[value],
            icon: FILTER_ICONS[value],
          }))}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardChartPanel
          title="روند ۷ روز اخیر"
          description="مقایسه بازدید و لایک روزانه"
          icon="solar:graph-up-bold-duotone"
          accentClassName="bg-primary"
          isLoading={timeseriesQuery.isPending}
          headerExtra={
            !timeseriesQuery.isPending && chartPoints.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                <StatChip
                  label="بازدید"
                  value={numberFormatter.format(periodStats.totalViews)}
                  toneClassName="text-primary"
                />
                <StatChip
                  label="لایک"
                  value={numberFormatter.format(periodStats.totalLikes)}
                  toneClassName="text-[var(--brand-accent)]"
                />
                <StatChip
                  label="میانگین تعامل"
                  value={`${periodStats.avgEngagement}%`}
                  toneClassName="text-foreground"
                />
              </div>
            ) : null
          }
        >
          {chartPoints.length === 0 ? (
            <ChartEmptyState message="هنوز دادهٔ روزانه ثبت نشده است." />
          ) : (
            <ReactECharts
              option={timeseriesOption}
              style={{ height: '100%', width: '100%' }}
              opts={chartOpts}
              notMerge
            />
          )}
        </DashboardChartPanel>

        <DashboardChartPanel
          title="آمار دسته‌ها"
          description="پربازدیدترین دسته‌ها بر اساس نوع محتوا"
          icon="solar:widget-5-bold-duotone"
          accentClassName="bg-[var(--brand-accent)]"
          isLoading={categoryQuery.isPending}
          headerExtra={
            <FilterPills<'audio' | 'video'>
              value={categoryKind}
              onChange={setCategoryKind}
              options={(['audio', 'video'] as const).map((value) => ({
                value,
                label: ENTITY_LABELS[value],
                icon: FILTER_ICONS[value],
              }))}
            />
          }
        >
          {categoryBars.length === 0 ? (
            <ChartEmptyState message="دسته‌ای برای نمایش یافت نشد." />
          ) : (
            <ReactECharts
              option={categoryOption}
              style={{ height: '100%', width: '100%' }}
              opts={chartOpts}
              notMerge
            />
          )}
        </DashboardChartPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <DashboardChartPanel
          title="تحلیل تعامل"
          description="رتبه‌بندی محتوا بر اساس نسبت لایک به بازدید"
          icon="solar:heart-pulse-bold-duotone"
          accentClassName="bg-[var(--chart-5)]"
          className="xl:col-span-2"
          chartHeightClassName="h-[20rem] sm:h-[22rem]"
          isLoading={topQuery.isPending}
        >
          {engagementAnalysis.length === 0 ? (
            <ChartEmptyState message="داده‌ای برای تحلیل تعامل موجود نیست." />
          ) : (
            <div className="flex h-full flex-col gap-3">
              <ReactECharts
                option={engagementOption}
                style={{ height: '58%', width: '100%' }}
                opts={chartOpts}
                notMerge
              />
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pe-1">
                {engagementAnalysis.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="rounded-xl border border-border/60 bg-background/50 px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {numberFormatter.format(item.views)} بازدید · {numberFormatter.format(item.likes)} لایک
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {item.engagementRate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DashboardChartPanel>

        <DashboardChartPanel
          title="برترین آثار"
          description="پر بازدیدترین محتوا در بازه اخیر"
          icon="solar:cup-star-bold-duotone"
          accentClassName="bg-amber-500"
          className="xl:col-span-3"
          chartHeightClassName="min-h-[20rem]"
          isLoading={topQuery.isPending}
        >
          {(topQuery.data?.items.length ?? 0) === 0 ? (
            <ChartEmptyState message="موردی برای نمایش نیست." />
          ) : (
            <div className="space-y-2.5">
              {topQuery.data?.items.map((item, index) => {
                const widthPercent = Math.max((item.views / maxTopViews) * 100, 6);

                return (
                  <div
                    key={`${item.entityType}-${item.entityId}`}
                    className="group rounded-xl border border-border/60 bg-background/50 px-3 py-3 transition-colors hover:border-primary/30 hover:bg-background/80"
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <span
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white',
                          index < 3 ? RANK_ACCENTS[index] : 'bg-muted-foreground/35',
                        )}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {ENTITY_LABELS[item.entityType] ?? item.entityType}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold tabular-nums text-foreground">
                          {numberFormatter.format(item.views)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">بازدید</p>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted/70">
                      <div
                        className="h-full rounded-full bg-linear-to-l from-brand-accent to-primary transition-all duration-700 group-hover:from-primary group-hover:to-brand-accent"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
                      <span>{numberFormatter.format(item.likes)} لایک</span>
                      <span>
                        {item.views > 0
                          ? `${Number(((item.likes / item.views) * 100).toFixed(1))}% تعامل`
                          : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DashboardChartPanel>
      </div>

      <DashboardTweetAnalytics />
    </section>
  );
}
