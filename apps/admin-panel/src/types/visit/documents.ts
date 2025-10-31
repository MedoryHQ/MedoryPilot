import { File } from "..";
import { Visit } from "./visit";

export interface VisitDocument extends File {
  visit: Visit;
  visitId: string;
}

export interface VisitDocumentResponse {
  data: VisitDocument;
}

export interface VisitDocumentsResponse {
  data: VisitDocument[];
  count: number;
}
