package com.dass.brindes.support;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Base class for integration tests against a real PostgreSQL Testcontainers instance.
 *
 * Transactional per test method (rolled back after each test) so tests sharing this
 * container don't collide on unique constraints (CPF/email). Two consequences to keep
 * in mind when extending this class:
 *  - Use MockMvc (same thread/transaction), not a real HTTP client against a random
 *    port: a separate request thread would not see data set up inside the test's
 *    transaction.
 *  - A test that intentionally triggers a real DB constraint violation (bypassing an
 *    application-level duplicate check) aborts the whole transaction; any further
 *    repository call in that same test method will fail with "current transaction
 *    is aborted" instead of behaving as expected.
 */
@SpringBootTest
@Testcontainers
@Transactional
public abstract class PostgresIntegrationTest {

	@Container
	@ServiceConnection
	static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

}
