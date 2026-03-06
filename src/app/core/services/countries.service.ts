import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, map } from 'rxjs';
import { Country, SimilarCountry } from '../models/country.model';

// /all permite máximo 10 campos — elegimos los necesarios para cards + algoritmo de similitud
const LIST_FIELDS = 'name,cca3,flags,population,area,region,subregion,capital,languages,borders';
const ALL_URL = `https://restcountries.com/v3.1/all?fields=${LIST_FIELDS}`;

// /alpha/{code} no tiene límite de campos — usarlo para el detalle completo
const DETAIL_FIELDS =
  'name,cca3,flags,population,area,region,subregion,capital,languages,currencies,borders,latlng,maps';

@Injectable({ providedIn: 'root' })
export class CountriesService {
  private readonly http = inject(HttpClient);

  /** Un sólo request HTTP por sesión gracias a shareReplay(1) */
  private readonly countries$ = this.http
    .get<Country[]>(ALL_URL)
    .pipe(shareReplay(1));

  getAll(): Observable<Country[]> {
    return this.countries$;
  }

  /** Obtiene el detalle completo desde /alpha/{cca3} (sin límite de campos) */
  getByCode(code: string): Observable<Country> {
    return this.http.get<Country>(
      `https://restcountries.com/v3.1/alpha/${code.toLowerCase()}?fields=${DETAIL_FIELDS}`,
    );
  }

  getSimilarCountries(
    target: Country,
    limit = 3,
  ): Observable<SimilarCountry[]> {
    return this.countries$.pipe(
      map((all) => {
        const others = all.filter((c) => c.cca3 !== target.cca3);
        return others
          .map((c) => ({
            country: c,
            score: this.calcScore(target, c, all),
            reason: this.buildReason(target, c),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
      }),
    );
  }

  /**
   * Puntuación de similitud con 5 rasgos ponderados:
   *   región      0.30
   *   subregión   0.25
   *   población   0.25  (escala logarítmica + normalización max-min)
   *   área        0.10  (escala logarítmica + normalización max-min)
   *   idiomas     0.10  (Jaccard)
   */
  private calcScore(
    target: Country,
    candidate: Country,
    all: Country[],
  ): number {
    // 1. Región
    const regionScore = target.region === candidate.region ? 1.0 : 0.0;

    // 2. Subregión
    const subregionScore =
      target.subregion === candidate.subregion ? 1.0 : 0.0;

    // 3. Población (log + min-max)
    const popLogs = all.map((c) => Math.log1p(c.population));
    const maxPop = Math.max(...popLogs);
    const minPop = Math.min(...popLogs);
    const popRange = maxPop - minPop || 1;
    const populationScore =
      1 -
      Math.abs(
        Math.log1p(target.population) - Math.log1p(candidate.population),
      ) /
        popRange;

    // 4. Área (log + min-max); área puede ser 0 o negativa → usamos max(0)
    const areaLogs = all.map((c) => Math.log1p(Math.max(c.area, 0)));
    const maxArea = Math.max(...areaLogs);
    const minArea = Math.min(...areaLogs);
    const areaRange = maxArea - minArea || 1;
    const areaScore =
      1 -
      Math.abs(
        Math.log1p(Math.max(target.area, 0)) -
          Math.log1p(Math.max(candidate.area, 0)),
      ) /
        areaRange;

    // 5. Idiomas — índice de Jaccard
    const langsA = new Set(Object.keys(target.languages ?? {}));
    const langsB = new Set(Object.keys(candidate.languages ?? {}));
    const intersection = [...langsA].filter((l) => langsB.has(l)).length;
    const union = new Set([...langsA, ...langsB]).size;
    const languageScore = union > 0 ? intersection / union : 0;

    return (
      regionScore * 0.3 +
      subregionScore * 0.25 +
      populationScore * 0.25 +
      areaScore * 0.1 +
      languageScore * 0.1
    );
  }

  private buildReason(target: Country, candidate: Country): string {
    const parts: string[] = [];

    if (target.region === candidate.region) {
      parts.push(`misma región (${target.region})`);
    }
    if (
      target.subregion &&
      target.subregion === candidate.subregion
    ) {
      parts.push(`misma subregión (${target.subregion})`);
    }

    const langsA = Object.values(target.languages ?? {});
    const langsB = Object.values(candidate.languages ?? {});
    const sharedLangs = langsA.filter((l) => langsB.includes(l));
    if (sharedLangs.length > 0) {
      parts.push(`idioma: ${sharedLangs[0]}`);
    }

    const larger = Math.max(target.population, candidate.population);
    const smaller = Math.min(target.population, candidate.population) || 1;
    if (larger / smaller < 3) {
      parts.push('población similar');
    }

    return parts.length > 0 ? parts.join(' · ') : 'perfil geográfico similar';
  }
}
