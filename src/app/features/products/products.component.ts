import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Category, sortBy, Product, searchState } from './products.model';
import { Categories, Prices, ProductsService } from './products.service';
import { CurrencyPipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
  timer,
} from 'rxjs';

@Component({
  selector: 'app-products',
  imports: [CurrencyPipe],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent {
  private readonly productServices = inject(ProductsService);
  query = signal('');
  options = signal<Category[]>(Categories);
  sortByOptions = signal<sortBy[]>(Prices);
  optionValue = signal('');
  sortByOptionsValue = signal('');
  readonly normalizedQuery = computed(() => this.query().toLowerCase());
  readonly normalizedOption = computed(() => this.optionValue().toLowerCase());
  readonly normalizedsortByOptions = computed(() => this.sortByOptionsValue());
  private readonly query$ = toObservable(this.normalizedQuery);
  private readonly option$ = toObservable(this.normalizedOption);
  private readonly optionPriec$ = toObservable(this.normalizedsortByOptions);
  private readonly products$ = this.productServices
    .getAllProducts()
    .pipe(map((response) => response.data));

  private readonly state$ = combineLatest([
    this.query$.pipe(distinctUntilChanged()),
    this.option$.pipe(distinctUntilChanged()),
    this.optionPriec$.pipe(distinctUntilChanged()),
    this.products$,
  ]).pipe(
    switchMap(([query, category, price, products]) => {
      if (query.length < 2 && !category && !price) {
        return of<searchState>({
          status: 'idle',
          product: products,
        });
      }
      return timer(300).pipe(
        switchMap(() =>
          this.productServices
            .filterProducts(query.length >= 2 ? query : '', category, price, products)
            .pipe(
              map(
                (product): searchState => ({
                  status: 'success',
                  product,
                }),
              ),
              catchError(() =>
                of<searchState>({
                  status: 'error',
                  message: 'Search Faild',
                }),
              ),
            ),
        ),
        startWith<searchState>({
          status: 'loading',
        }),
      );
    }),
  );
  // private readonly categoryState$ = combineLatest([
  //   this.option$.pipe(distinctUntilChanged()),
  //   this.products$,
  // ]).pipe(
  //   switchMap(([name, products]) => {
  //     if (name == '') {
  //       return of<searchState>({
  //         status: 'idle',
  //         product: products,
  //       });
  //     }
  //     return timer(300).pipe(
  //       switchMap(() =>
  //         this.productServices.filterByCategory(name, products).pipe(
  //           map(
  //             (product): searchState => ({
  //               status: 'success',
  //               product,
  //             }),
  //             catchError(() =>
  //               of<searchState>({
  //                 status: 'error',
  //                 message: 'Search Faild',
  //               }),
  //             ),
  //           ),
  //         ),
  //       ),
  //       startWith<searchState>({
  //         status: 'loading',
  //       }),
  //     );
  //   }),
  // );
  readonly state = toSignal(this.state$, {
    initialValue: {
      status: 'loading',
    } as searchState,
  });
}
