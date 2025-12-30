
export interface Recipe {
  id: number;
  name: string;
  style: string;
  instructions: string;
}

export interface AnalysisResult {
  ingredients: string[];
  recipes: Recipe[];
  sources?: { uri: string; title: string }[];
  error?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
