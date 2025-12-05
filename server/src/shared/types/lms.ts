export interface GoogleOAuthTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_expiry: string;
  token_type: string;
}

// Error response from Google OAuth API
export interface GoogleOAuthErrorResponse {
  error: string;
  error_description?: string;
}

// Raw response from Google token endpoint (before we add token_expiry)
export type GoogleOAuthRawResponse =
  | Omit<GoogleOAuthTokenResponse, "token_expiry">
  | GoogleOAuthErrorResponse;
