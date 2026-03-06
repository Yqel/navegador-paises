# Navegador de Países

App Angular 21 que permite explorar países del mundo, ver detalles, encontrar los 3 más similares y guardar favoritos en Firestore.

**Demo:** [URL pública en Firebase — pendiente de deploy]
**Repo:** [este repositorio]

---

## Reto elegido y alcance

**Mini-proyecto:** Navegador de países (REST Countries) + similares

**Alcance implementado:**
- Lista de 250+ países con búsqueda en tiempo real y filtro por región
- Detalle de país con todos los datos relevantes
- Algoritmo de similitud con 5 rasgos ponderados para sugerir 3 países similares
- **Toque elegido:** mini-gráfica comparativa (población, área, idiomas) entre el país target y sus similares
- Persistencia: Firestore (favoritos sincronizados en tiempo real)
- Estados: loading / vacío / error en todas las vistas

**Supuestos:**
- Se usa REST Countries v3.1 como única fuente de datos (sin backend propio)
- Los favoritos son públicos (sin autenticación) dado el scope del reto
- El "score" de similitud es relativo al conjunto completo de países (normalización max-min)

---

## Arquitectura y dependencias

```
src/app/
├── core/                    # Servicios singleton e interfaces de dominio
│   ├── models/
│   │   └── country.model.ts          # Tipos: Country, SimilarCountry
│   └── services/
│       ├── countries.service.ts      # Fetch + caché + algoritmo similitud
│       └── favorites.service.ts      # CRUD Firestore con Signals
├── features/                # Rutas lazy-loaded
│   ├── countries-list/      # Lista con filtros
│   ├── country-detail/      # Detalle + similares + gráfica
│   └── favorites/           # Estantería de favoritos
└── shared/                  # Componentes y pipes reutilizables
    ├── components/
    │   ├── country-card/         # Tarjeta reutilizable
    │   ├── comparison-chart/     # Bar chart con ng2-charts/chart.js
    │   └── empty-state/          # Estado vacío/error genérico
    └── pipes/
        └── population-format.pipe.ts  # Formatea números grandes (M, B, K)
```

**Stack:**
| Tecnología | Versión | Justificación |
|---|---|---|
| Angular | 21.2 | Stack requerido; standalone + Signals en lugar de NgRx |
| Angular Material | 21.2 | Design system consistente, accesibilidad built-in |
| Firebase / Firestore | 11.x | Persistencia en tiempo real, deploy simple |
| @angular/fire | 20.x | SDK oficial Angular para Firebase |
| ng2-charts + chart.js | 4.x | Gráfica comparativa ligera |

---

## Modelo de datos

### REST Countries (fuente externa, sólo lectura)
Sólo se solicitan los campos necesarios con `?fields=` para reducir el payload (~120 KB vs ~500 KB full):
```
name, cca3, flags, population, area, region, subregion,
capital, languages, currencies, borders, latlng, maps
```

### Firestore — colección `favorites`
```
favorites/{cca3}  →  {
  cca3: string,         // PK, código ISO 3166-1 alpha-3
  name: { common, official },
  flags: { svg, png, alt },
  region: string,
  population: number,
  capital: string[]
}
```
Solo se persisten campos esenciales para minimizar escrituras y costo de Firestore.

---

## Estado y navegación

- **Signals** (`signal`, `computed`) para estado reactivo sin overhead de NgRx
- `ChangeDetectionStrategy.OnPush` en todos los componentes
- **Lazy loading** en todas las rutas (`loadComponent`)
- `withViewTransitions()` para transiciones nativas entre rutas
- Caché de países con `shareReplay(1)` — un sólo fetch HTTP por sesión

---

## Decisiones técnicas

1. **Signals en lugar de NgRx**: scope del reto no justifica el boilerplate de NgRx; los Signals de Angular 21 cubren perfectamente el estado local.

2. **Pesos semánticos en el algoritmo**: región (0.30) + subregión (0.25) tiene más peso que perfil demográfico porque la similitud cultural es más intuitiva que la numérica. Ver `calcScore()` en `countries.service.ts`.

3. **`shareReplay(1)`**: evita re-fetches al navegar. 250+ países × múltiples navegaciones = ahorro de red significativo.

4. **`@angular/fire` con `--legacy-peer-deps`**: v20.x aún no soporta Angular 21 oficialmente; documentado en `.npmrc` para reproducibilidad.

5. **Favoritos con campos mínimos**: se guardan solo los necesarios para la tarjeta para reducir costo de escrituras en Firestore.

---

## Escalabilidad y mantenimiento

- **Separación de capas**: `core` → `features` → `shared`. Cambiar la fuente de datos solo requiere modificar `countries.service.ts`.
- Para >1000 países: `CdkVirtualScrollViewport` en la lista.
- Para múltiples usuarios: Firebase Auth + filtrar favoritos por UID.
- El algoritmo de similitud está encapsulado → reemplazable sin tocar componentes.

---

## Seguridad y validaciones

- La API es pública GET-only → sin riesgo de exposición.
- Credenciales de Firebase en `environment.ts` (no en código de producción; en CI/CD como variables de entorno).
- Reglas de Firestore en `firestore.rules`.
- No hay inputs de usuario que lleguen a la base de datos.
- XSS: Angular escapa interpolado automáticamente; no se usa `innerHTML`.

---

## Rendimiento

- `?fields=` en REST Countries reduce el payload de ~500 KB a ~120 KB
- `shareReplay(1)` → un sólo request HTTP por sesión
- `ChangeDetectionStrategy.OnPush` en todos los componentes
- Lazy loading: bundle inicial ~72 KB; features bajo demanda
- `loading="lazy"` en banderas de tarjetas; `loading="eager"` en detalle
- **Pendiente**: virtual scroll para lista de 250+ países

---

## Accesibilidad

- Todas las imágenes con `alt` descriptivo
- Botones con `aria-label` explícito
- Roles semánticos: `role="list"`, `role="listitem"`, `role="article"`, `role="status"`
- `aria-live="polite"` en contadores y estados
- Navegación por teclado: `tabindex="0"` + `focus-visible` visible
- Contraste WCAG AA con Angular Material (paleta azure)
- Jerarquía de headings: h1 → h2 → h3

---

## Uso de IA

- **Scaffolding del servicio**: GitHub Copilot generó el esqueleto de `CountriesService`. Reescribí los tipos para ajustarlos al shape real de REST Countries v3.1 (Copilot asumía una versión antigua de la API).

- **Algoritmo de similitud**: Copilot propuso distancia euclidiana pura. Lo rechacé y diseñé pesos semánticos porque distancia euclidiana sin normalización favorece países grandes por diferencia absoluta de población. Copilot implementó la fórmula una vez que le di el diseño.

- **`buildReason()` — textos legibles**: Copilot generó las frases en español. Revisé para evitar redundancias ("misma región · misma región").

- **`EmptyStateComponent`**: Copilot generó el componente con `ng-content`. Acepté — es un patrón estático y verificable.

- **Riesgos detectados y mitigados**:
  - Tipos incorrectos (API v2 vs v3.1) → validé contra documentación oficial
  - Score sin normalización → normalización max-min per feature
  - `NgChartsModule` deprecado en ng2-charts v4 → corregido con `BaseChartDirective`

- **Prompts clave (resumen)**:
  - "Crea un Angular 21 standalone service con HttpClient que cachea todos los países con shareReplay y expone getCountryByCode."
  - "Implementa getSimilarCountries con pesos semánticos: región 0.30, subregión 0.25, población normalizada 0.25, área 0.10, overlap de idiomas 0.10."
  - "Genera un EmptyStateComponent standalone con icon/title/subtitle como @Input y ng-content para actions."

- **Lecciones**: Copilot es muy útil para boilerplate y patrones, pero requiere supervisión en versiones de libs, algoritmos con datos reales y edge cases (países sin idiomas, sin área).

- **Siguientes mejoras**: agregar Gemini API gratuita para generar descripciones narrativas de similitud en lugar de la lógica rule-based actual.

---

## Limitaciones y siguientes pasos

| Limitación | Mejora propuesta |
|---|---|
| Sin autenticación | Firebase Auth → favoritos por usuario |
| Lista sin virtual scroll | `CdkVirtualScrollViewport` |
| Similitud rule-based | LLM/embedding para similitud semántica |
| Sin tests unitarios | Specs para `calcScore()` y el pipe |
| `@angular/fire@20` en Angular 21 | Actualizar cuando fire@21 sea estable |

---

## Instalación y ejecución

```bash
# Clonar
git clone <repo-url>
cd navegador-paises

# Instalar (legacy-peer-deps por @angular/fire vs Angular 21)
npm install

# Configurar Firebase en src/environments/environment.ts

# Correr en local
ng serve
# → http://localhost:4200
```

## Configuración de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilita **Firestore Database**
3. Copia la configuración en `src/environments/environment.ts`:

```typescript
firebase: {
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  ...
}
```

## Despliegue

```bash
npm install -g firebase-tools
firebase login
firebase init          # Hosting + Firestore
ng build --configuration production
firebase deploy
```
