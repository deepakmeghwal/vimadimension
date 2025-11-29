import React from 'react';
import './Skeleton.css';

const Skeleton = ({
    variant = 'text',
    width,
    height,
    className = '',
    style = {}
}) => {
    const getVariantClass = () => {
        switch (variant) {
            case 'circular': return 'skeleton-circular';
            case 'rectangular': return 'skeleton-rectangular';
            case 'title': return 'skeleton-title';
            case 'button': return 'skeleton-button';
            case 'text':
            default: return 'skeleton-text';
        }
    };

    const styles = {
        width,
        height,
        ...style
    };

    return (
        <div
            className={`skeleton ${getVariantClass()} ${className}`}
            style={styles}
        ></div>
    );
};

export default Skeleton;
