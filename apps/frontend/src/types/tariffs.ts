export interface TariffResponse {
  data: Tariff;
}

export interface Tariff {
  id: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}
