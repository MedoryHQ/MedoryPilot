export interface TariffsResponse {
  data: TariffTable[];
  count: {
    total: number;
  };
}

export interface TariffResponse {
  data: Tariff;
}

export interface TariffTable {
  id: string;
  price: number;
  tariffId?: string;
  fromDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  __type: "history" | "tariff";
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
