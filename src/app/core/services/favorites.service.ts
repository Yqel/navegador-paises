import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Firestore,
  collection,
  onSnapshot,
  query,
  doc,
  setDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Country, FavoriteCountry } from '../models/country.model';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly firestore = inject(Firestore);

  /** Estado reactivo con Signals */
  private readonly _favorites = signal<FavoriteCountry[]>([]);
  readonly favorites = this._favorites.asReadonly();
  readonly count = computed(() => this._favorites().length);

  constructor() {
    this.subscribeToFavorites();
  }

  private subscribeToFavorites(): void {
    // Todo desde @angular/fire/firestore — sin mezclar con firebase/firestore
    const col = collection(this.firestore, 'favorites');
    onSnapshot(
      query(col),
      (snapshot) => {
        const data = snapshot.docs.map(
          (d) => ({ ...d.data(), cca3: d.id }) as FavoriteCountry,
        );
        this._favorites.set(data);
      },
      (err) => console.error('[FavoritesService] Error al cargar favoritos:', err),
    );
  }

  isFavorite(cca3: string): boolean {
    return this._favorites().some((f) => f.cca3 === cca3);
  }

  async addFavorite(country: Country): Promise<void> {
    const favorite: FavoriteCountry = {
      cca3: country.cca3,
      name: country.name,
      flags: country.flags,
      region: country.region,
      population: country.population,
      capital: country.capital ?? [],
      addedAt: Date.now(),
    };
    const ref = doc(this.firestore, `favorites/${country.cca3}`);
    await setDoc(ref, favorite);
  }

  async removeFavorite(cca3: string): Promise<void> {
    const ref = doc(this.firestore, `favorites/${cca3}`);
    await deleteDoc(ref);
  }

  async toggleFavorite(country: Country): Promise<void> {
    if (this.isFavorite(country.cca3)) {
      await this.removeFavorite(country.cca3);
    } else {
      await this.addFavorite(country);
    }
  }
}
