import React, { useEffect, useState } from 'react';
import { PROJECT_STAGES } from '../../constants/projectEnums';

const ProjectLifecycleChevron = ({ currentStage, horizontal = false }) => {
    // Map PROJECT_STAGES to lifecycle stages with groups
    // Stages are based on Council of Architecture (COA) India standards
    const allStages = PROJECT_STAGES.map(stage => {
        // Group stages logically based on COA India standards
        let group = 'Design & Planning';

        switch (stage.value) {
            case 'CONCEPT':
            case 'PRELIM':
                group = 'Design & Planning';
                break;
            case 'STATUTORY':
            case 'TENDER':
                group = 'Approval & Documentation';
                break;
            case 'CONTRACT':
            case 'CONSTRUCTION':
                group = 'Construction';
                break;
            case 'COMPLETION':
                group = 'Closeout';
                break;
            default:
                group = 'Design & Planning';
        }

        return {
            id: stage.value,
            label: stage.label,
            group: group
        };
    });

    const timelineStages = allStages;

    const currentIndex = timelineStages.findIndex(s => s.id === currentStage);
    const [animatedIndex, setAnimatedIndex] = useState(-1);

    // Group stages
    const groups = timelineStages.reduce((acc, stage) => {
        if (!acc[stage.group]) {
            acc[stage.group] = [];
        }
        acc[stage.group].push(stage);
        return acc;
    }, {});

    const groupKeys = Object.keys(groups);

    // Animate progress when stage changes
    useEffect(() => {
        if (currentIndex >= 0) {
            // Staggered animation
            const timer = setTimeout(() => {
                setAnimatedIndex(currentIndex);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [currentIndex]);

    const getStageStatus = (stageId) => {
        const index = timelineStages.findIndex(s => s.id === stageId);
        if (index < currentIndex) return 'completed';
        if (index === currentIndex) return 'current';
        return 'pending';
    };

    if (horizontal) {
        return (
            <div className="lifecycle-container horizontal">
                <div className="lifecycle-track horizontal">
                    {/* Background Line */}
                    <div className="lifecycle-line-bg horizontal"></div>

                    {/* Progress Line */}
                    <div
                        className="lifecycle-line-progress horizontal"
                        style={{
                            width: `${currentIndex >= 0 ? ((currentIndex) / (timelineStages.length - 1)) * 100 : 0}%`
                        }}
                    ></div>

                    {/* Stages */}
                    <div className="lifecycle-stages-horizontal">
                        {timelineStages.map((stage, index) => {
                            const status = getStageStatus(stage.id);
                            const isAnimated = index <= animatedIndex;

                            return (
                                <div key={stage.id} className={`lifecycle-stage-horizontal ${status} ${isAnimated ? 'animate-in' : ''}`}>
                                    <div className="lifecycle-node-horizontal">
                                        {status === 'completed' && (
                                            <svg className="lifecycle-icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                        {status === 'current' && (
                                            <div className="lifecycle-pulse"></div>
                                        )}
                                        {status === 'pending' && (
                                            <div className="lifecycle-dot"></div>
                                        )}
                                    </div>
                                    <div className="lifecycle-label-horizontal">
                                        {stage.label}
                                        {status === 'current' && (
                                            <span className="lifecycle-runner" role="img" aria-label="running">🐆</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="lifecycle-container vertical">
            <div className="lifecycle-track vertical">
                {/* Background Line */}
                <div className="lifecycle-line-bg"></div>

                {/* Progress Line */}
                <div
                    className="lifecycle-line-progress"
                    style={{
                        height: `${currentIndex >= 0 ? ((currentIndex) / (timelineStages.length - 1)) * 100 : 0}%`
                    }}
                ></div>

                {groupKeys.map((groupName, groupIndex) => (
                    <div key={groupName} className="lifecycle-group">
                        <div className="lifecycle-group-label">{groupName}</div>
                        <div className="lifecycle-group-stages">
                            {groups[groupName].map((stage) => {
                                const status = getStageStatus(stage.id);
                                const globalIndex = timelineStages.findIndex(s => s.id === stage.id);
                                const isAnimated = globalIndex <= animatedIndex;

                                return (
                                    <div key={stage.id} className={`lifecycle-stage ${status} ${isAnimated ? 'animate-in' : ''}`}>
                                        <div className="lifecycle-node-container">
                                            <div className="lifecycle-node">
                                                {status === 'completed' && (
                                                    <svg className="lifecycle-icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                )}
                                                {status === 'current' && (
                                                    <div className="lifecycle-pulse"></div>
                                                )}
                                                {status === 'pending' && (
                                                    <div className="lifecycle-dot"></div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="lifecycle-content">
                                            <div className="lifecycle-label">
                                                {stage.label}
                                                {status === 'current' && (
                                                    <span className="lifecycle-runner" role="img" aria-label="running">🐆</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectLifecycleChevron;
