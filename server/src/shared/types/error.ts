export interface ErrorObject {
  name: string;
  subType: string;
  message: string;
  details: string;
  statusCode: number;
  extra: {
    [key: string]: any;
  };
}
