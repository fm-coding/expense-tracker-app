package com.pm.expenseservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean("taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4); // Minimum number of threads to keep in the pool
        executor.setMaxPoolSize(8); // Maximum number of threads in the pool
        executor.setQueueCapacity(200); // Capacity of the queue for holding tasks before they are executed
        executor.setKeepAliveSeconds(60); // Time to keep idle threads alive
        executor.setThreadNamePrefix("Expense-Async-"); // Prefix for thread names for easier debugging
        executor.setWaitForTasksToCompleteOnShutdown(true); //Waits for all tasks to finish before shutting down
        executor.setAwaitTerminationSeconds(30); // Maximum wait time for tasks to complete on shutdown
        executor.initialize();
        return executor;
    }
}