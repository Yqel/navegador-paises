import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'countries',
    pathMatch: 'full',
  },
  {
    path: 'countries',
    loadComponent: () =>
      import('./features/countries-list/countries-list.component').then(
        (m) => m.CountriesListComponent,
      ),
    title: 'Explorar Países',
  },
  {
    path: 'countries/:cca3',
    loadComponent: () =>
      import('./features/country-detail/country-detail.component').then(
        (m) => m.CountryDetailComponent,
      ),
    title: 'Detalle del País',
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./features/favorites/favorites.component').then(
        (m) => m.FavoritesComponent,
      ),
    title: 'Mis Favoritos',
  },
  {
    path: '**',
    redirectTo: 'countries',
  },
];
