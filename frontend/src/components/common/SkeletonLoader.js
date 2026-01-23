import React from 'react';
import '../projects/ProjectDetails.css'; // Corrected path to styles

export const SkeletonLoader = ({ type = 'text', width, height, className = '', style = {} }) => {
    const classes = `skeleton skeleton-${type} ${className}`;
    const customStyle = {
        width,
        height,
        ...style
    };

    return <div className={classes} style={customStyle}></div>;
};

export const SkeletonTaskRow = () => {
    return (
        <div className="asana-task-row skeleton-row" style={{ gridTemplateColumns: 'minmax(400px, 1fr) 150px 150px 120px 120px 80px' }}>
            <div className="asana-task-name-cell">
                <SkeletonLoader type="circle" width="18px" height="18px" style={{ marginRight: '0.75rem' }} />
                <SkeletonLoader type="text" width="60%" height="1rem" />
            </div>
            <div className="asana-task-assignee">
                <SkeletonLoader type="circle" width="24px" height="24px" style={{ marginRight: '0.5rem' }} />
                <SkeletonLoader type="text" width="80px" height="0.9rem" />
            </div>
            <div className="asana-task-date">
                <SkeletonLoader type="text" width="80px" height="0.9rem" />
            </div>
            <div>
                <SkeletonLoader type="rect" width="60px" height="20px" style={{ borderRadius: '4px' }} />
            </div>
            <div>
                <SkeletonLoader type="rect" width="70px" height="20px" style={{ borderRadius: '4px' }} />
            </div>
            <div></div>
        </div>
    );
};

export const SkeletonProjectRow = () => {
    return (
        <tr className="skeleton-row">
            <td style={{ padding: '1rem' }}>
                <SkeletonLoader type="text" width="70%" height="1.1rem" style={{ marginBottom: '0.5rem' }} />
                <SkeletonLoader type="text" width="40%" height="0.8rem" />
            </td>
            <td style={{ padding: '1rem' }}><SkeletonLoader type="text" width="60%" height="1rem" /></td>
            <td style={{ padding: '1rem' }}><SkeletonLoader type="rect" width="80px" height="24px" style={{ borderRadius: '4px' }} /></td>
            <td style={{ padding: '1rem' }}><SkeletonLoader type="rect" width="70px" height="24px" style={{ borderRadius: '12px' }} /></td>
            <td style={{ padding: '1rem' }}><SkeletonLoader type="rect" width="60px" height="24px" style={{ borderRadius: '4px' }} /></td>
            <td style={{ padding: '1rem' }}><SkeletonLoader type="text" width="50%" height="1rem" /></td>
            <td style={{ padding: '1rem' }}><SkeletonLoader type="text" width="80px" height="1rem" /></td>
            <td style={{ padding: '1rem' }}><SkeletonLoader type="text" width="60px" height="1rem" /></td>
            <td style={{ padding: '1rem' }}><SkeletonLoader type="rect" width="50px" height="28px" style={{ borderRadius: '4px' }} /></td>
        </tr>
    );
};

export const SkeletonUserRow = () => {
    return (
        <tr className="skeleton-row">
            <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <SkeletonLoader type="circle" width="36px" height="36px" />
                <div style={{ flex: 1 }}>
                    <SkeletonLoader type="text" width="140px" height="1rem" style={{ marginBottom: '0.25rem' }} />
                    <SkeletonLoader type="text" width="100px" height="0.8rem" />
                </div>
            </td>
            <td style={{ padding: '1rem' }}><SkeletonLoader type="text" width="120px" height="1rem" /></td>
            <td style={{ padding: '1rem' }}><SkeletonLoader type="text" width="150px" height="1rem" /></td>
            <td style={{ padding: '1rem' }}><SkeletonLoader type="rect" width="80px" height="24px" style={{ borderRadius: '12px' }} /></td>
            <td style={{ padding: '1rem' }}><SkeletonLoader type="rect" width="60px" height="24px" style={{ borderRadius: '12px' }} /></td>
            <td style={{ padding: '1rem', textAlign: 'right' }}><SkeletonLoader type="circle" width="32px" height="32px" style={{ display: 'inline-block' }} /></td>
        </tr>
    );
};
