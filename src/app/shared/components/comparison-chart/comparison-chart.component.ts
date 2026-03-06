import {
  Component,
  ChangeDetectionStrategy,
  input,
  effect,
  signal,
} from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Country, SimilarCountry } from '../../../core/models/country.model';

@Component({
  selector: 'app-comparison-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './comparison-chart.component.html',
  styleUrl: './comparison-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparisonChartComponent {
  readonly target = input.required<Country>();
  readonly similars = input.required<SimilarCountry[]>();

  constructor() {
    effect(() => {
      const t = this.target();
      const s = this.similars();
      if (t && s?.length) this.buildChart(t, s);
    });
  }

  /** Signal de datos del chart — compatible con OnPush */
  readonly chartData = signal<ChartData<'bar', number[], string> | null>(null);
  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.dataset.label ?? '';
            const value = ctx.parsed.y ?? 0;
            if (label.includes('Población')) return `${label}: ${value.toFixed(1)}M hab.`;
            if (label.includes('Área')) return `${label}: ${value.toFixed(0)}K km²`;
            return `${label}: ${value} idiomas`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Valor normalizado' },
      },
    },
  };

  private buildChart(target: Country, similars: SimilarCountry[]): void {
    const countries = [
      target,
      ...similars.map((s) => s.country),
    ];

    const labels = countries.map((c) => c.name.common);

    // Normalizar a escala legible
    const populations = countries.map((c) => +(c.population / 1_000_000).toFixed(2));
    const areas = countries.map((c) => +(Math.max(c.area, 0) / 1_000).toFixed(1));
    const langs = countries.map((c) => Object.keys(c.languages ?? {}).length);

    this.chartData.set({
      labels,
      datasets: [
        {
          label: 'Población (M hab.)',
          data: populations,
          backgroundColor: 'rgba(25, 118, 210, 0.7)',
          borderColor: 'rgba(25, 118, 210, 1)',
          borderWidth: 1,
        },
        {
          label: 'Área (K km²)',
          data: areas,
          backgroundColor: 'rgba(56, 142, 60, 0.7)',
          borderColor: 'rgba(56, 142, 60, 1)',
          borderWidth: 1,
        },
        {
          label: 'Idiomas',
          data: langs,
          backgroundColor: 'rgba(245, 124, 0, 0.7)',
          borderColor: 'rgba(245, 124, 0, 1)',
          borderWidth: 1,
        },
      ],
    });
  }
}
