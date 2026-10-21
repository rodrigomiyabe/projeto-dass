package com.dass.brindes;

import org.springframework.boot.SpringApplication;

public class TestBrindesApplication {

	public static void main(String[] args) {
		SpringApplication.from(BrindesApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
