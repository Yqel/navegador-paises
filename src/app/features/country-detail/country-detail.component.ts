import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Country, SimilarCountry } from '../../core/models/country.model';
import { CountriesService } from '../../core/services/countries.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { CountryCardComponent } from '../../shared/components/country-card/country-card.component';
import { ComparisonChartComponent } from '../../shared/components/comparison-chart/comparison-chart.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PopulationFormatPipe } from '../../shared/pipes/population-format.pipe';

@Component({
  selector: 'app-country-detail',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    CountryCardComponent,
    ComparisonChartComponent,
    EmptyStateComponent,
    PopulationFormatPipe,
  ],
  templateUrl: './country-detail.component.html',
  styleUrl: './country-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountryDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly countriesService = inject(CountriesService);
  readonly favoritesService = inject(FavoritesService);

  readonly country = signal<Country | null>(null);
  readonly similars = signal<SimilarCountry[]>([]);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const code = params.get('cca3') ?? '';
          this.isLoading.set(true);
          this.hasError.set(false);
          this.country.set(null);
          this.similars.set([]);
          return this.countriesService.getByCode(code);
        }),
      )
      .subscribe({
        next: (country) => {
          this.country.set(country);
          this.isLoading.set(false);
          this.loadSimilars(country);
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  private loadSimilars(country: Country): void {
    this.countriesService.getSimilarCountries(country).subscribe({
      next: (similars) => this.similars.set(similars),
      error: () => console.error('Error al cargar países similares'),
    });
  }

  async onToggleFavorite(): Promise<void> {
    const c = this.country();
    if (c) await this.favoritesService.toggleFavorite(c);
  }

  getLanguages(country: Country): string {
    return Object.values(country.languages ?? {}).join(', ') || '—';
  }

  getCurrencies(country: Country): string {
    return (
      Object.values(country.currencies ?? {})
        .map((c) => `${c.name} (${c.symbol})`)
        .join(', ') || '—'
    );
  }
}
