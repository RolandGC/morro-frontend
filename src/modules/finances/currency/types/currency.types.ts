export interface Currency {
    id: string,
    name: string;
    code: string;
    symbol: string;
    is_base: boolean;
    is_active: boolean;
}
export interface CurrencyQueryParams {
    page?: number;
    limit?: number;
    name?: string;
    code?: string;
    is_base?: boolean;
    is_active?: boolean;
  }