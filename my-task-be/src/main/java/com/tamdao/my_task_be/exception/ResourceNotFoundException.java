package com.tamdao.my_task_be.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String resourceName, Long id) {
        super(String.format("Không tìm thấy %s với id: %d", resourceName, id));
    }
}
