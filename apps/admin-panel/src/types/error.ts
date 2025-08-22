export interface ResponseError {
  response: {
    data: {
      error?: {
        ka: string;
        en: string;
      };
      errors?: {
        type: string;
        value: string;
        msg:
          | {
              ka: string;
              en: string;
              isList: true;
            }
          | string;
        path: string;
        location: string;
      }[];
    };
  };
}
