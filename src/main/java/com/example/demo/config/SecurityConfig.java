package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import java.util.List;

@Configuration @EnableWebSecurity
public class SecurityConfig 
{

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception 
    {
        http.csrf(AbstractHttpConfigurer::disable).cors(cors -> cors.configurationSource(request -> {CorsConfiguration config = new CorsConfiguration();config.setAllowedOriginPatterns(List.of("*"));config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));config.setAllowedHeaders(List.of("*"));config.setAllowCredentials(true);
                return config;
            })).authorizeHttpRequests(auth -> auth.anyRequest().permitAll()).headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable)).formLogin(AbstractHttpConfigurer::disable).httpBasic(AbstractHttpConfigurer::disable);
        
        return http.build();
    }

    @Bean
    public PasswordEncoder passw() 
    {
        return new BCryptPasswordEncoder();
    }
}