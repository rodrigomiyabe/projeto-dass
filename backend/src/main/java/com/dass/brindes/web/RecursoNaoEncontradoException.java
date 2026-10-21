package com.dass.brindes.web;

/**
 * Thrown when a requested resource cannot be found.
 */
public class RecursoNaoEncontradoException extends RuntimeException {

	public RecursoNaoEncontradoException(String message) {
		super(message);
	}

}
