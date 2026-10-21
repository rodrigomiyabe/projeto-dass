package com.dass.brindes.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Restricts CORS to the Angular frontend's local development origin.
 * No other origin is allowed; "*" must never be used here.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

	private static final String FRONTEND_ORIGIN = "http://localhost:4200";

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**")
				.allowedOrigins(FRONTEND_ORIGIN)
				.allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
				.allowedHeaders("*")
				.allowCredentials(true);
	}

}
