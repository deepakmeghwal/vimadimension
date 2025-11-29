package org.example.util;

/**
 * Utility class for normalizing email addresses and usernames.
 * Ensures consistent handling across authentication and user management flows.
 */
public class EmailNormalizer {

    /**
     * Normalize an email address or username by trimming whitespace and converting to lowercase.
     * 
     * @param input the email or username to normalize
     * @return normalized string (lowercase, trimmed), or null if input is null
     */
    public static String normalize(String input) {
        if (input == null) {
            return null;
        }
        return input.trim().toLowerCase();
    }

    /**
     * Check if an email/username is already normalized.
     * 
     * @param input the email or username to check
     * @return true if already normalized, false otherwise
     */
    public static boolean isNormalized(String input) {
        if (input == null) {
            return true;
        }
        return input.equals(normalize(input));
    }
}
