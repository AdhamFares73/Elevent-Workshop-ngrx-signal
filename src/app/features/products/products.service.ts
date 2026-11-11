import { inject, Injectable } from '@angular/core';
import { defer, finalize, map, Observable, switchMap, timer } from 'rxjs';
import { Category, sortBy, Product, ProductsResponse } from './products.model';
import { HttpClient } from '@angular/common/http';
export const Categories: Category[] = [
  { id: 1, name: 'Music' },
  { id: 2, name: "Men's Fashion" },
  { id: 3, name: "Women's Fashion" },
  { id: 4, name: 'Electronics' },
];
export const Prices: sortBy[] = [
  { id: 1, value: 'Low to High' },
  { id: 2, value: 'High to Low' },
  { id: 3, value: 'A to Z' },
  { id: 4, value: 'Z to A' },
];
@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly http = inject(HttpClient);

  getAllProducts(): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>('https://ecommerce.routemisr.com/api/v1/products');
  }
  filterProducts(
    query: string,
    name: string,
    sortBy: string,
    products: Product[],
  ): Observable<Product[]> {
    return defer(() =>
      timer(300).pipe(
        map(() => {
          const productsFilter = products.filter((product) => {
            const isQuery = !query || product.title.toLowerCase().includes(query.toLowerCase());
            const isCategory = !name || product.category.name.toLowerCase() == name.toLowerCase();

            return isQuery && isCategory; // لازم يحقق الشرطين
          });

          return productsFilter.sort((a, b) => {
            switch (sortBy) {
              case 'Low to High':
                return a.price - b.price;

              case 'High to Low':
                return b.price - a.price;

              case 'A to Z':
                return a.title.localeCompare(b.title);

              case 'Z to A':
                return b.title.localeCompare(a.title);

              default:
                return 0;
            }
          });
        }),
        finalize(() => {
          console.log('finished filter');
        }),
      ),
    );
  }
  // search(query: string, products: Product[]): Observable<Product[]> {
  //   return defer(() =>
  //     timer(300).pipe(
  //       map(() => {
  //         return products.filter((product) =>
  //           product.title.toLowerCase().includes(query.toLowerCase()),
  //         );
  //       }),
  //       finalize(() => {
  //         console.log('finished');
  //       }),
  //     ),
  //   );
  // }
  // filterByCategory(name: string, products: Product[]): Observable<Product[]> {
  //   return defer(() =>
  //     timer(300).pipe(
  //       map(() => {
  //         return products.filter(
  //           (product) => product.category.name.toLowerCase() == name.toLowerCase(),
  //         );
  //       }),
  //       finalize(() => {
  //         console.log('finished Filter');
  //       }),
  //     ),
  //   );
  // }
}
