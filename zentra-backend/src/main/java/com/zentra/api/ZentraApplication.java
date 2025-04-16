package com.zentra.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // For reminder functionality
public class ZentraApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZentraApplication.class, args);
    }
} 