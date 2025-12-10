import { ErrorObject } from "../error";

export interface ServerSuccessResponse<T> {
    success: true;
    message: string;
    data: T | null;
    error: null;

}
export interface ServerErrorResponse {
    success: false;
    data: null;
    error: ErrorObject
}