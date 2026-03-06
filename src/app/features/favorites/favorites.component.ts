import {
  Component,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FavoritesService } from '../../core/services/favorites.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PopulationFormatPipe } from '../../shared/pipes/population-format.pipe';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    EmptyStateComponent,
    PopulationFormatPipe,
  ],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesComponent {
  readonly favoritesService = inject(FavoritesService);

  async onRemove(cca3: string, event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    await this.favoritesService.removeFavorite(cca3);
  }
}
