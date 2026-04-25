package org.example.backend.services.impl;

import lombok.RequiredArgsConstructor;
import org.example.backend.models.Notification;
import org.example.backend.repositories.NotificationRepository;
import org.example.backend.services.NotificationService;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Profile("!mock")
@RequiredArgsConstructor
public class MongoNotificationService implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndReadFalse(userId);
    }

    @Override
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Override
    public Notification markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    public Notification createNotification(String userId, String title, String message, String type) {
        Notification notification = new Notification(userId, title, message, type);
        return notificationRepository.save(notification);
    }

    @Override
    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }
}
