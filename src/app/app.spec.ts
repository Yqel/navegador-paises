import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal, computed } from '@angular/core';
import { App } from './app';
import { FavoritesService } from './core/services/favorites.service';
import { routes } from './app.routes';

/** Mock del FavoritesService — sin Firestore real */
const favoritesServiceMock = {
  favorites: signal([]).asReadonly(),
  count: computed(() => 0),
  isFavorite: () => false,
  toggleFavorite: async () => {},
  addFavorite: async () => {},
  removeFavorite: async () => {},
};

describe('App (componente raíz)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        { provide: FavoritesService, useValue: favoritesServiceMock },
      ],
    }).compileComponents();
  });

  it('debe crear el componente raíz', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debe renderizar la barra de navegación', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const nav = fixture.nativeElement as HTMLElement;
    expect(nav.querySelector('mat-toolbar')).not.toBeNull();
  });
});
