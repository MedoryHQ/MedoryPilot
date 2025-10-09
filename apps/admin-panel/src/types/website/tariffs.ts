export interface TariffsResponse {
  data: Tariff[];
  count: number;
}

export interface TariffResponse {
  data: Tariff;
}

export interface Tariff {
  id: string;
  price: number;
  history: TariffHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface TariffHistory {
  id: string;
  price: number;
  fromDate: string;
  endDate: string;
  current: Tariff;
  tariffId: string;
  createdAt: string;
  updatedAt: string;
}

export type TariffFormValues = {
  price: number;
};
