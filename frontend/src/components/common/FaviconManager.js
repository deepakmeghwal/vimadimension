import { useEffect } from 'react';
import { getOrganizationInitials } from '../../utils/organizationLogo';

const FaviconManager = ({ user }) => {
    useEffect(() => {
        const updateFavicon = () => {
            const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);

            if (user?.organizationLogoUrl) {
                link.href = user.organizationLogoUrl;
            } else if (user?.organizationName || user?.username) {
                // Generate favicon from initials
                const initials = getOrganizationInitials(user.organizationName || user.username);
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                const ctx = canvas.getContext('2d');

                // Background
                ctx.fillStyle = '#4F46E5'; // Indigo-600
                ctx.beginPath();
                ctx.arc(32, 32, 32, 0, 2 * Math.PI);
                ctx.fill();

                // Text
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 28px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(initials, 32, 32);

                link.href = canvas.toDataURL();
            } else {
                // Reset to default (firm logo) if no user
                link.href = '/images/logo_final_black_tab.svg';
            }
        };

        updateFavicon();
    }, [user]);

    return null;
};

export default FaviconManager;
