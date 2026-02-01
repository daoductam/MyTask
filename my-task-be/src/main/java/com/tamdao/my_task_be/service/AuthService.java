package com.tamdao.my_task_be.service;

import com.tamdao.my_task_be.dto.request.LoginRequest;
import com.tamdao.my_task_be.dto.request.RegisterRequest;
import com.tamdao.my_task_be.dto.response.AuthResponse;
import com.tamdao.my_task_be.dto.response.UserResponse;
import com.tamdao.my_task_be.entity.User;
import com.tamdao.my_task_be.exception.BadRequestException;
import com.tamdao.my_task_be.entity.Workspace;
import com.tamdao.my_task_be.repository.WorkspaceRepository;
import com.tamdao.my_task_be.repository.UserRepository;
import com.tamdao.my_task_be.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã được sử dụng");
        }
        
        // Create new user
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .build();
        
        user = userRepository.save(user);

        // Create default workspace
        Workspace workspace = Workspace.builder()
                .name("My Workspace")
                .owner(user)
                .color("#6366F1")
                .build();
        workspaceRepository.save(workspace);
        
        // Generate tokens
        String accessToken = tokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());
        
        return AuthResponse.of(accessToken, refreshToken, UserResponse.fromEntity(user));
    }
    
    public AuthResponse login(LoginRequest request) {
        // Authenticate
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        // Get user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));
        
        // Generate tokens
        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());
        
        return AuthResponse.of(accessToken, refreshToken, UserResponse.fromEntity(user));
    }
    
    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Token không hợp lệ hoặc đã hết hạn");
        }
        
        String email = tokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));
        
        String newAccessToken = tokenProvider.generateAccessToken(email);
        String newRefreshToken = tokenProvider.generateRefreshToken(email);
        
        return AuthResponse.of(newAccessToken, newRefreshToken, UserResponse.fromEntity(user));
    }
}
