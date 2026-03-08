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

export const UnauthorizedErrorObject: ErrorObject = {
  name: "UnauthorizedError",
  subType: "Unauthorized",
  message: "Unauthorized",
  details: "Unauthorized",
  statusCode: 401,
  extra: {},
};
