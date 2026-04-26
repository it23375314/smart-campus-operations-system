package org.example.backend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.backend.models.Role;
import org.example.backend.models.User;
import org.example.backend.repositories.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // Check if user exists, if not create one
        Optional<User> existingUser = userRepository.findByEmail(email);

        User user;
        if (existingUser.isEmpty()) {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name != null ? name : email);
            newUser.setPassword("OAUTH_USER");
            newUser.setRole(Role.USER);
            newUser.setActive(true);
            newUser.setCreatedAt(LocalDateTime.now());
            user = userRepository.save(newUser); // ✅ capture saved user with ID
        } else {
            user = existingUser.get();
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        // Encode name safely for URL
        String encodedName = java.net.URLEncoder.encode(
            user.getName() != null ? user.getName() : email,
            "UTF-8"
        );

        // Redirect to frontend with token
        String redirectUrl = "http://localhost:5173/oauth-success"
                + "?token=" + token
                + "&name=" + encodedName
                + "&email=" + user.getEmail()
                + "&role=" + user.getRole().name()
                + "&id=" + (user.getId() != null ? user.getId() : "");

        response.sendRedirect(redirectUrl);
    }
}