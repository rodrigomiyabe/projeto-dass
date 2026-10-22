package com.dass.brindes.web;

import jakarta.servlet.http.HttpServletRequest;
import java.time.OffsetDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * Translates exceptions thrown by controllers into a consistent {@link ApiError} response.
 *
 * <p>No handler ever leaks an internal exception message or stack trace to the client -
 * the generic {@link Exception} handler returns a fixed, safe message and logs the real
 * cause server-side instead.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger LOG = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiError> tratarValidacao(MethodArgumentNotValidException ex, HttpServletRequest request) {
		List<ApiError.CampoErro> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
				.map(this::paraCampoErro)
				.toList();

		ApiError erro = new ApiError(OffsetDateTime.now(), HttpStatus.BAD_REQUEST.value(),
				HttpStatus.BAD_REQUEST.getReasonPhrase(), "Dados inválidos", request.getRequestURI(), fieldErrors);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
	}

	@ExceptionHandler(RecursoNaoEncontradoException.class)
	public ResponseEntity<ApiError> tratarRecursoNaoEncontrado(RecursoNaoEncontradoException ex,
			HttpServletRequest request) {
		ApiError erro = new ApiError(OffsetDateTime.now(), HttpStatus.NOT_FOUND.value(),
				HttpStatus.NOT_FOUND.getReasonPhrase(), ex.getMessage(), request.getRequestURI(), List.of());
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erro);
	}

	@ExceptionHandler(RecursoDuplicadoException.class)
	public ResponseEntity<ApiError> tratarRecursoDuplicado(RecursoDuplicadoException ex, HttpServletRequest request) {
		ApiError erro = new ApiError(OffsetDateTime.now(), HttpStatus.CONFLICT.value(),
				HttpStatus.CONFLICT.getReasonPhrase(), ex.getMessage(), request.getRequestURI(), List.of());
		return ResponseEntity.status(HttpStatus.CONFLICT).body(erro);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ApiError> tratarMensagemIlegivel(HttpMessageNotReadableException ex,
			HttpServletRequest request) {
		ApiError erro = new ApiError(OffsetDateTime.now(), HttpStatus.BAD_REQUEST.value(),
				HttpStatus.BAD_REQUEST.getReasonPhrase(), "Corpo da requisição inválido ou malformado",
				request.getRequestURI(), List.of());
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
	}

	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ResponseEntity<ApiError> tratarTipoDeArgumentoInvalido(MethodArgumentTypeMismatchException ex,
			HttpServletRequest request) {
		String mensagem = "Parâmetro '" + ex.getName() + "' possui valor inválido";
		ApiError erro = new ApiError(OffsetDateTime.now(), HttpStatus.BAD_REQUEST.value(),
				HttpStatus.BAD_REQUEST.getReasonPhrase(), mensagem, request.getRequestURI(), List.of());
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
	}

	@ExceptionHandler(NoResourceFoundException.class)
	public ResponseEntity<ApiError> tratarRecursoDeRotaNaoEncontrado(NoResourceFoundException ex,
			HttpServletRequest request) {
		ApiError erro = new ApiError(OffsetDateTime.now(), HttpStatus.NOT_FOUND.value(),
				HttpStatus.NOT_FOUND.getReasonPhrase(), "Recurso não encontrado", request.getRequestURI(),
				List.of());
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erro);
	}

	@ExceptionHandler(HttpRequestMethodNotSupportedException.class)
	public ResponseEntity<ApiError> tratarMetodoNaoSuportado(HttpRequestMethodNotSupportedException ex,
			HttpServletRequest request) {
		ApiError erro = new ApiError(OffsetDateTime.now(), HttpStatus.METHOD_NOT_ALLOWED.value(),
				HttpStatus.METHOD_NOT_ALLOWED.getReasonPhrase(), "Método HTTP não suportado para este recurso",
				request.getRequestURI(), List.of());
		return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(erro);
	}

	@ExceptionHandler(HttpMediaTypeNotSupportedException.class)
	public ResponseEntity<ApiError> tratarTipoDeMidiaNaoSuportado(HttpMediaTypeNotSupportedException ex,
			HttpServletRequest request) {
		ApiError erro = new ApiError(OffsetDateTime.now(), HttpStatus.UNSUPPORTED_MEDIA_TYPE.value(),
				HttpStatus.UNSUPPORTED_MEDIA_TYPE.getReasonPhrase(), "Tipo de mídia não suportado",
				request.getRequestURI(), List.of());
		return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(erro);
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ApiError> tratarViolacaoDeIntegridade(DataIntegrityViolationException ex,
			HttpServletRequest request) {
		LOG.warn("Violação de integridade de dados ao processar {}", request.getRequestURI(), ex);
		ApiError erro = new ApiError(OffsetDateTime.now(), HttpStatus.CONFLICT.value(),
				HttpStatus.CONFLICT.getReasonPhrase(), "CPF ou e-mail já cadastrado", request.getRequestURI(),
				List.of());
		return ResponseEntity.status(HttpStatus.CONFLICT).body(erro);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiError> tratarErroInterno(Exception ex, HttpServletRequest request) {
		LOG.error("Erro interno não tratado ao processar {}", request.getRequestURI(), ex);
		ApiError erro = new ApiError(OffsetDateTime.now(), HttpStatus.INTERNAL_SERVER_ERROR.value(),
				HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(), "Erro interno. Tente novamente mais tarde.",
				request.getRequestURI(), List.of());
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
	}

	private ApiError.CampoErro paraCampoErro(FieldError fieldError) {
		return new ApiError.CampoErro(fieldError.getField(), fieldError.getDefaultMessage());
	}

}
