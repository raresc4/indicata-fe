export interface Environment {
  readonly apiBaseUrl: string;
}

export const environment: Environment = {
  apiBaseUrl: 'http://localhost:8000',
};
