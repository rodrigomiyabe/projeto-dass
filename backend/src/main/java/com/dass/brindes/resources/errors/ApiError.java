package com.dass.brindes.resources.errors;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Standard error payload returned by the API for any failed request.
 */
public record ApiError(
		OffsetDateTime timestamp,
		int status,
		String error,
		String message,
		String path,
		List<CampoErro> fieldErrors) {

	/**
	 * A single field-level validation error.
	 */
	public record CampoErro(String campo, String mensagem) {
	}

}
