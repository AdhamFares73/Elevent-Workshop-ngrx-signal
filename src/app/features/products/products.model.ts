export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: Category;
  imageCover: string;
}
export interface ProductsResponse {
  result: number;
  metaData: metaData;
  data: Product[];
}
interface metaData {
  currentPage: number;
  numberOfPage: number;
  limit: number;
  nextPage: number;
}
export interface Category {
  id: number;
  name: string;
}
export interface sortBy {
  id: number;
  value: string;
}
export type searchState =
  | { status: 'idle'; product: Product[] } // All Products
  | { status: 'error'; message: string }
  | { status: 'loading' }
  | { status: 'success'; product: Product[] }; // All products Matching the search Value
