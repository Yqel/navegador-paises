export interface CountryName {
  common: string;
  official: string;
}

export interface CountryFlags {
  svg: string;
  png: string;
  alt?: string;
}

export interface CountryCurrencyDetail {
  name: string;
  symbol: string;
}

export interface Country {
  name: CountryName;
  cca3: string;
  flags: CountryFlags;
  population: number;
  area: number;
  region: string;
  subregion: string;
  capital: string[];
  languages: Record<string, string>;
  currencies: Record<string, CountryCurrencyDetail>;
  borders: string[];
  latlng: [number, number];
  maps: {
    googleMaps: string;
    openStreetMaps: string;
  };
}

export interface SimilarCountry {
  country: Country;
  score: number;
  reason: string;
}

/** Sólo los campos necesarios para la tarjeta — minimiza escrituras en Firestore */
export interface FavoriteCountry {
  cca3: string;
  name: CountryName;
  flags: CountryFlags;
  region: string;
  population: number;
  capital: string[];
  addedAt: number;
}
