package org.example.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_entries", indexes = {
    @Index(name = "idx_attendance_user_id", columnList = "user_id"),
    @Index(name = "idx_attendance_timestamp", columnList = "timestamp")
})
public class AttendanceEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "entry_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private EntryType entryType;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "notes")
    private String notes;

    public enum EntryType {
        CLOCK_IN, CLOCK_OUT
    }

    public AttendanceEntry() {}

    public AttendanceEntry(User user, EntryType entryType, LocalDateTime timestamp) {
        this.user = user;
        this.entryType = entryType;
        this.timestamp = timestamp;
    }

    public AttendanceEntry(User user, EntryType entryType, LocalDateTime timestamp, String notes) {
        this.user = user;
        this.entryType = entryType;
        this.timestamp = timestamp;
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public EntryType getEntryType() {
        return entryType;
    }

    public void setEntryType(EntryType entryType) {
        this.entryType = entryType;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    @JsonProperty("userId")
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    @JsonProperty("username")
    public String getUsername() {
        return user != null ? user.getUsername() : null;
    }

    @JsonProperty("userFullName")
    public String getUserFullName() {
        return user != null ? (user.getName() != null ? user.getName() : user.getUsername()) : null;
    }
}