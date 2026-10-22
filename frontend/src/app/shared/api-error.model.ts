/**
 * A single field-level validation error, as returned in `ApiError.fieldErrors`.
 * Mirrors the backend's `ApiError.CampoErro` (see `docs/API.md`).
 */
export interface CampoErro {
  campo: string;
  mensagem: string;
}

/**
 * Standard error payload returned by the API for any failed request.
 * Mirrors the backend's `ApiError` (see `docs/API.md`).
 */
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: CampoErro[];
}
