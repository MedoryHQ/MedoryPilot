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
  fromDate: string;
  endDate?: string;
  isCurrent: boolean;
  parentId: string;
  parent?: Tariff;
  versions: Tariff[];
  createdAt: string;
  updatedAt: string;
}

export type TariffFormValues = {
  price: number;
};
