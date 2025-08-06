export interface CreateLanguageDTO {
  code: string;
  name: string;
  order?: number;
}

export interface UpdateLanguageDTO extends CreateLanguageDTO {
  id: string;
}
