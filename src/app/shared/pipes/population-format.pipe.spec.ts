import { PopulationFormatPipe } from './population-format.pipe';

/**
 * Tests unitarios del pipe PopulationFormatPipe.
 *
 * Un "test unitario" prueba una sola unidad de código en aislamiento,
 * sin depender de servicios externos, HTTP ni base de datos.
 * El pipe es ideal para esto porque es una función pura: misma entrada → misma salida.
 */
describe('PopulationFormatPipe', () => {
  let pipe: PopulationFormatPipe;

  // beforeEach se ejecuta antes de CADA test — garantiza estado limpio
  beforeEach(() => {
    pipe = new PopulationFormatPipe();
  });

  // ─── Casos con miles de millones ────────────────────────────────────────────
  it('debe formatear 1.200.000.000 como "1.2B"', () => {
    expect(pipe.transform(1_200_000_000)).toBe('1.2B');
  });

  it('debe formatear exactamente 1.000.000.000 como "1.0B"', () => {
    expect(pipe.transform(1_000_000_000)).toBe('1.0B');
  });

  // ─── Casos con millones ──────────────────────────────────────────────────────
  it('debe formatear 45.000.000 como "45.0M"', () => {
    expect(pipe.transform(45_000_000)).toBe('45.0M');
  });

  it('debe formatear 1.500.000 como "1.5M"', () => {
    expect(pipe.transform(1_500_000)).toBe('1.5M');
  });

  // ─── Casos con miles ─────────────────────────────────────────────────────────
  it('debe formatear 850.000 como "850K"', () => {
    expect(pipe.transform(850_000)).toBe('850K');
  });

  it('debe formatear 1.000 como "1K"', () => {
    expect(pipe.transform(1_000)).toBe('1K');
  });

  // ─── Valores pequeños ────────────────────────────────────────────────────────
  it('debe formatear 999 como "999" (sin sufijo)', () => {
    expect(pipe.transform(999)).toBe('999');
  });

  it('debe formatear 0 como "0"', () => {
    expect(pipe.transform(0)).toBe('0');
  });

  // ─── Casos borde (edge cases) ────────────────────────────────────────────────
  it('debe devolver "—" para null', () => {
    expect(pipe.transform(null as unknown as number)).toBe('—');
  });

  it('debe devolver "—" para NaN', () => {
    expect(pipe.transform(NaN)).toBe('—');
  });

  it('debe devolver "—" para undefined', () => {
    expect(pipe.transform(undefined as unknown as number)).toBe('—');
  });
});
