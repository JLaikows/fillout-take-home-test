export type FilterClauseType = {
  id: string;
  condition: "equals" | "does_not_equal" | "greater_than" | "less_than";
  value: number | string | Date;
};

export type ResponseFiltersType = FilterClauseType[];

export type questionsType = {
  id: string | number;
  name: string;
  type: string;
  value: string | number | Date;
};

export type ResponseType = {
  submissionId: string;
  submissionTime: string;
  lastUpdatedAt: string;
  questions: questionsType[];
  calculations: any[];
  urlParameters: any[];
  quiz: any;
  documents: any;
};
