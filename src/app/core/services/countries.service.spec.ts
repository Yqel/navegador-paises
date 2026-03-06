import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CountriesService } from './countries.service';
import { Country } from '../models/country.model';

/**
 * Tests unitarios de CountriesService.
 *
 * Aquí usamos un "mock de HTTP": en lugar de hacer peticiones reales a
 * restcountries.com, interceptamos las solicitudes y respondemos con datos
 * falsos controlados. Esto hace los tests rápidos, deterministas y sin
 * dependencia de red.
 */

/** Países ficticios para los tests — mínimo de campos necesarios */
const mockCountries: Country[] = [
  {
    name: { common: 'España', official: 'Reino de España' },
    cca3: 'ESP',
    flags: { svg: '', png: '', alt: '' },
    population: 47_000_000,
    area: 505_990,
    region: 'Europe',
    subregion: 'Southern Europe',
    capital: ['Madrid'],
    languages: { spa: 'Spanish' },
    currencies: { EUR: { name: 'Euro', symbol: '€' } },
    borders: ['PRT', 'FRA', 'AND'],
    latlng: [40, -4],
    maps: { googleMaps: '', openStreetMaps: '' },
  },
  {
    name: { common: 'Portugal', official: 'República Portuguesa' },
    cca3: 'PRT',
    flags: { svg: '', png: '', alt: '' },
    population: 10_300_000,
    area: 92_212,
    region: 'Europe',
    subregion: 'Southern Europe',
    capital: ['Lisbon'],
    languages: { por: 'Portuguese' },
    currencies: { EUR: { name: 'Euro', symbol: '€' } },
    borders: ['ESP'],
    latlng: [39.5, -8],
    maps: { googleMaps: '', openStreetMaps: '' },
  },
  {
    name: { common: 'Francia', official: 'República Francesa' },
    cca3: 'FRA',
    flags: { svg: '', png: '', alt: '' },
    population: 67_000_000,
    area: 551_695,
    region: 'Europe',
    subregion: 'Western Europe',
    capital: ['Paris'],
    languages: { fra: 'French' },
    currencies: { EUR: { name: 'Euro', symbol: '€' } },
    borders: ['ESP', 'BEL', 'LUX', 'DEU', 'CHE', 'ITA', 'MCO', 'AND'],
    latlng: [46, 2],
    maps: { googleMaps: '', openStreetMaps: '' },
  },
  {
    name: { common: 'Japón', official: 'Japón' },
    cca3: 'JPN',
    flags: { svg: '', png: '', alt: '' },
    population: 125_000_000,
    area: 377_930,
    region: 'Asia',
    subregion: 'Eastern Asia',
    capital: ['Tokyo'],
    languages: { jpn: 'Japanese' },
    currencies: { JPY: { name: 'Japanese yen', symbol: '¥' } },
    borders: [],
    latlng: [35, 138],
    maps: { googleMaps: '', openStreetMaps: '' },
  },
];

const LIST_URL =
  'https://restcountries.com/v3.1/all?fields=name,cca3,flags,population,area,region,subregion,capital,languages,borders';

describe('CountriesService', () => {
  let service: CountriesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CountriesService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CountriesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // Después de cada test, verifica que no quedaron requests sin resolver
  afterEach(() => httpMock.verify());

  // ─── getAll() ────────────────────────────────────────────────────────────────
  describe('getAll()', () => {
    it('debe retornar la lista de países desde la API', async () => {
      const promise = firstValueFrom(service.getAll());
      httpMock.expectOne(LIST_URL).flush(mockCountries);
      const countries = await promise;

      expect(countries).toHaveLength(4);
      expect(countries[0].cca3).toBe('ESP');
    });

    it('debe hacer un solo request HTTP gracias a shareReplay(1)', async () => {
      // Dos suscripciones simultáneas — debe generar solo 1 request
      const p1 = firstValueFrom(service.getAll());
      const p2 = firstValueFrom(service.getAll());
      httpMock.expectOne(LIST_URL).flush(mockCountries);
      await Promise.all([p1, p2]);
      // expectOne lanzaría error si hubiera más de 1 request → confirma shareReplay
    });
  });

  // ─── getSimilarCountries() ───────────────────────────────────────────────────
  describe('getSimilarCountries()', () => {
    it('debe retornar máximo 3 países similares', async () => {
      const promise = firstValueFrom(service.getSimilarCountries(mockCountries[0]));
      httpMock.expectOne(LIST_URL).flush(mockCountries);
      const similars = await promise;

      expect(similars.length).toBeLessThanOrEqual(3);
    });

    it('no debe incluir el país objetivo en los resultados', async () => {
      const target = mockCountries[0]; // España
      const promise = firstValueFrom(service.getSimilarCountries(target));
      httpMock.expectOne(LIST_URL).flush(mockCountries);
      const similars = await promise;

      const codes = similars.map((s) => s.country.cca3);
      expect(codes).not.toContain('ESP');
    });

    it('debe priorizar países de la misma región y subregión (mayor score primero)', async () => {
      const target = mockCountries[0]; // España — Europe / Southern Europe
      const promise = firstValueFrom(service.getSimilarCountries(target));
      httpMock.expectOne(LIST_URL).flush(mockCountries);
      const similars = await promise;

      // Portugal comparte región Y subregión con España → debe ser el más similar
      expect(similars[0].country.cca3).toBe('PRT');
      // Los scores deben estar ordenados de mayor a menor
      const scores = similars.map((s) => s.score);
      expect(scores).toEqual([...scores].sort((a, b) => b - a));
    });

    it('cada resultado debe incluir un campo reason no vacío', async () => {
      const promise = firstValueFrom(service.getSimilarCountries(mockCountries[0]));
      httpMock.expectOne(LIST_URL).flush(mockCountries);
      const similars = await promise;

      for (const item of similars) {
        expect(item.reason.length).toBeGreaterThan(0);
      }
    });
  });
});
