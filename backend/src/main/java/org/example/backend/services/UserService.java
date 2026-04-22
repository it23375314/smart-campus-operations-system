package org.example.backend.services;

import org.example.backend.models.Role;
import org.example.backend.models.User;
import java.util.List;

public interface UserService {
    List<User> getManagers();
    List<User> getAllUsers();
}
