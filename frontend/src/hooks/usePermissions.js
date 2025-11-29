import { useMemo } from 'react';

/**
 * Custom hook for checking user permissions and roles
 * @param {Object} user - User object with roles and permissions
 * @returns {Object} Permission checking functions
 */
export const usePermissions = (user) => {
    // Memoize permission and role sets for performance
    const { permissions, roleNames } = useMemo(() => {
        if (!user) {
            return { permissions: new Set(), roleNames: new Set() };
        }

        // Extract all permissions from user's roles
        const perms = new Set();
        const roles = new Set();

        if (user.roles) {
            user.roles.forEach(role => {
                roles.add(role.name);
                if (role.permissions) {
                    role.permissions.forEach(perm => {
                        if (typeof perm === 'string') {
                            perms.add(perm);
                        } else if (perm && perm.name) {
                            perms.add(perm.name);
                        }
                    });
                }
            });
        }

        // Also check if permissions are directly on user object
        if (user.permissions) {
            user.permissions.forEach(perm => perms.add(perm));
        }

        return { permissions: perms, roleNames: roles };
    }, [user]);

    return useMemo(() => {
        /**
         * Check if user has a specific permission
         */
        const hasPermission = (permission) => {
            return permissions.has(permission);
        };

        /**
         * Check if user has any of the specified permissions
         */
        const hasAnyPermission = (...permissionList) => {
            return permissionList.some(perm => permissions.has(perm));
        };

        /**
         * Check if user has all of the specified permissions
         */
        const hasAllPermissions = (...permissionList) => {
            return permissionList.every(perm => permissions.has(perm));
        };

        /**
         * Check if user has a specific role
         */
        const hasRole = (roleName) => {
            return roleNames.has(roleName);
        };

        /**
         * Check if user has any of the specified roles
         */
        const hasAnyRole = (...roleList) => {
            return roleList.some(role => roleNames.has(role));
        };

        /**
         * Check if user is an admin
         */
        const isAdmin = () => {
            return roleNames.has('ROLE_ADMIN');
        };

        /**
         * Check if user is HR
         */
        const isHR = () => {
            return roleNames.has('ROLE_HR');
        };

        /**
         * Check if user is a manager
         */
        const isManager = () => {
            return roleNames.has('ROLE_MANAGER');
        };

        /**
         * Get all user permissions as an array
         */
        const getAllPermissions = () => {
            return Array.from(permissions);
        };

        /**
         * Get all user roles as an array
         */
        const getAllRoles = () => {
            return Array.from(roleNames);
        };

        return {
            hasPermission,
            hasAnyPermission,
            hasAllPermissions,
            hasRole,
            hasAnyRole,
            isAdmin,
            isHR,
            isManager,
            getAllPermissions,
            getAllRoles,
            permissions: Array.from(permissions),
            roles: Array.from(roleNames)
        };
    }, [permissions, roleNames]);
};
