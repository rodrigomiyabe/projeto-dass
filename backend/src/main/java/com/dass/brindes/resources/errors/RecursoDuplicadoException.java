package com.dass.brindes.resources.errors;

/**
 * Thrown when a resource would violate a uniqueness constraint (e.g. duplicate CPF or email).
 */
public class RecursoDuplicadoException extends RuntimeException {

	public RecursoDuplicadoException(String message) {
		super(message);
	}

}
