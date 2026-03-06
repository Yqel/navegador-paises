import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formatea un número de habitantes en unidades legibles:
 *   1_200_000_000  →  "1.2B"
 *   45_000_000     →  "45M"
 *   850_000        →  "850K"
 *   999            →  "999"
 */
@Pipe({
  name: 'populationFormat',
  standalone: true,
  pure: true,
})
export class PopulationFormatPipe implements PipeTransform {
  transform(value: number): string {
    if (value == null || isNaN(value)) return '—';
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(0)}K`;
    }
    return value.toString();
  }
}
