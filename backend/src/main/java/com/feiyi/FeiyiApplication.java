package com.feiyi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class FeiyiApplication {
    public static void main(String[] args) {
        SpringApplication.run(FeiyiApplication.class, args);
    }
}
