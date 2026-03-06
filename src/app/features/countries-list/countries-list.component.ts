import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Country } from '../../core/models/country.model';
import { CountriesService } from '../../core/services/countries.service';
import { CountryCardComponent } from '../../shared/components/country-card/country-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-countries-list',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CountryCardComponent,
    EmptyStateComponent,
  ],
  templateUrl: './countries-list.component.html',
  styleUrl: './countries-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountriesListComponent implements OnInit {
  private readonly countriesService = inject(CountriesService);

  readonly allCountries = signal<Country[]>([]);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly searchTerm = signal('');
  readonly selectedRegion = signal('');

  readonly regions = computed(() => {
    const regionSet = new Set(this.allCountries().map((c) => c.region).filter(Boolean));
    return Array.from(regionSet).sort();
  });

  readonly filteredCountries = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const region = this.selectedRegion();

    return this.allCountries()
      .filter((c) => {
        const matchesName = !term || c.name.common.toLowerCase().includes(term);
        const matchesRegion = !region || c.region === region;
        return matchesName && matchesRegion;
      })
      .sort((a, b) => a.name.common.localeCompare(b.name.common));
  });

  ngOnInit(): void {
    this.countriesService.getAll().subscribe({
      next: (countries) => {
        this.allCountries.set(countries);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  onRegionChange(value: string): void {
    this.selectedRegion.set(value);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedRegion.set('');
  }
}
