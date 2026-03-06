import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Country } from '../../../core/models/country.model';
import { FavoritesService } from '../../../core/services/favorites.service';
import { PopulationFormatPipe } from '../../pipes/population-format.pipe';

@Component({
  selector: 'app-country-card',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    PopulationFormatPipe,
  ],
  templateUrl: './country-card.component.html',
  styleUrl: './country-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountryCardComponent {
  /** Signal input — reactive con OnPush */
  readonly country = input.required<Country>();

  private readonly favoritesService = inject(FavoritesService);

  /** Se recalcula cuando cambia el país o el estado de favoritos */
  readonly isFavorite = computed(() =>
    this.favoritesService.isFavorite(this.country().cca3),
  );

  async onToggleFavorite(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    await this.favoritesService.toggleFavorite(this.country());
  }
}
