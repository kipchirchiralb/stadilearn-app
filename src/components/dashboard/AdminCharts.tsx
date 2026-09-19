"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

ChartJS.defaults.font.family = "Inter, sans-serif";
ChartJS.defaults.color = "#3f484c";
ChartJS.defaults.borderColor = "#dee3e4";

export const CHART_PALETTE = [
  "#004d61",
  "#fd6604",
  "#006680",
  "#4a616d",
  "#a33e00",
  "#87d1ee",
  "#ffb596",
  "#b2cad9",
  "#026781",
  "#7c2e00",
  "#334955",
  "#ffdbcd",
];

const tooltip = {
  backgroundColor: "#171d1e",
  titleFont: { family: "Plus Jakarta Sans, sans-serif", size: 12, weight: 600 as const },
  bodyFont: { family: "Inter, sans-serif", size: 12 },
  padding: 10,
  cornerRadius: 8,
};

function colorsFor(length: number, override?: string[]) {
  const base = override?.length ? override : CHART_PALETTE;
  return Array.from({ length }, (_, i) => base[i % base.length]);
}

function empty(values: number[]) {
  return values.length === 0 || values.every((v) => v === 0);
}

function EmptyState() {
  return (
    <div className="h-56 flex items-center justify-center font-body-sm text-body-sm text-on-surface-variant">
      No data yet
    </div>
  );
}

export function DoughnutChart({
  labels,
  values,
  colors,
}: {
  labels: string[];
  values: number[];
  colors?: string[];
}) {
  if (empty(values)) return <EmptyState />;
  const palette = colorsFor(values.length, colors);
  const data: ChartData<"doughnut"> = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: palette,
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };
  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { boxWidth: 10, boxHeight: 10, padding: 12, font: { size: 11 } },
      },
      tooltip,
    },
  };
  return (
    <div className="relative h-56">
      <Doughnut data={data} options={options} />
    </div>
  );
}

export function BarChart({
  labels,
  values,
  label = "Count",
  color = "#004d61",
  horizontal = false,
}: {
  labels: string[];
  values: number[];
  label?: string;
  color?: string;
  horizontal?: boolean;
}) {
  if (empty(values)) return <EmptyState />;
  const data: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label,
        data: values,
        backgroundColor: color,
        borderRadius: 6,
        maxBarThickness: 28,
      },
    ],
  };
  const options: ChartOptions<"bar"> = {
    indexAxis: horizontal ? "y" : "x",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip },
    scales: {
      x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, font: { size: 11 } } },
      y: { beginAtZero: true, ticks: { precision: 0, font: { size: 11 } }, grid: { color: "#eaeff0" } },
    },
  };
  return (
    <div className="relative h-64">
      <Bar data={data} options={options} />
    </div>
  );
}

export function DualBarChart({
  labels,
  series,
}: {
  labels: string[];
  series: { label: string; values: number[]; color: string }[];
}) {
  if (series.every((s) => empty(s.values))) return <EmptyState />;
  const data: ChartData<"bar"> = {
    labels,
    datasets: series.map((s) => ({
      label: s.label,
      data: s.values,
      backgroundColor: s.color,
      borderRadius: 4,
      maxBarThickness: 18,
    })),
  };
  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { boxWidth: 10, boxHeight: 10, padding: 12, font: { size: 11 } } },
      tooltip,
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxRotation: 40, minRotation: 0, font: { size: 10 } } },
      y: { beginAtZero: true, ticks: { precision: 0, font: { size: 11 } }, grid: { color: "#eaeff0" } },
    },
  };
  return (
    <div className="relative h-72">
      <Bar data={data} options={options} />
    </div>
  );
}

export function LineChart({
  labels,
  values,
  label = "Count",
  color = "#004d61",
}: {
  labels: string[];
  values: number[];
  label?: string;
  color?: string;
}) {
  if (values.length === 0) return <EmptyState />;
  const data: ChartData<"line"> = {
    labels,
    datasets: [
      {
        label,
        data: values,
        borderColor: color,
        backgroundColor: `${color}1f`,
        fill: true,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
    ],
  };
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip },
    scales: {
      x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8, font: { size: 11 } } },
      y: { beginAtZero: true, ticks: { precision: 0, font: { size: 11 } }, grid: { color: "#eaeff0" } },
    },
  };
  return (
    <div className="relative h-56">
      <Line data={data} options={options} />
    </div>
  );
}
