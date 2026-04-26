package org.example.backend.services.impl;

import org.example.backend.models.Notification;
import org.example.backend.services.NotificationService;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Profile("mock")
public class MockNotificationService implements NotificationService {

    @Override
    public List<Notification> getUserNotifications(String userId) {
        return new ArrayList<>();
    }

    @Override
    public List<Notification> getUnreadNotifications(String userId) {
        return new ArrayList<>();
    }

    @Override
    public long getUnreadCount(String userId) {
        // Return 0 to prevent 500 errors during periodic polling in the mock environment
        return 0;
    }

    @Override
    public Notification markAsRead(String notificationId) {
        return null;
    }

    @Override
    public void markAllAsRead(String userId) {
        // Mock success
    }

    @Override
    public Notification createNotification(String userId, String title, String message, String type) {
        return new Notification(userId, title, message, type);
    }

    @Override
    public void deleteNotification(String notificationId) {
        // Mock success
    }
}
