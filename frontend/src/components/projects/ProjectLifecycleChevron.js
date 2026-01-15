import React, { useEffect, useState } from 'react';
import { PROJECT_STAGES } from '../../constants/projectEnums';

const ProjectLifecycleChevron = ({ currentStage, lifecycleStages = [], horizontal = false }) => {
    // Use provided lifecycle stages or fall back to all PROJECT_STAGES
    const stagesToRender = (lifecycleStages && lifecycleStages.length > 0)
        ? PROJECT_STAGES.filter(stage => lifecycleStages.includes(stage.value))
        : PROJECT_STAGES;

    // Map stages to lifecycle stages with groups
    // Stages are based on Council of Architecture (COA) India standards
    const allStages = stagesToRender.map(stage => {
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
        <div className="lifecycle-container vertical single-stage">
            {/* Show only current stage */}
            {timelineStages.filter(s => s.id === currentStage).map(stage => (
                <div key={stage.id} className="lifecycle-stage current animate-in">
                    <div className="lifecycle-node-container">
                        <div className="lifecycle-node">
                            <div className="lifecycle-pulse"></div>
                        </div>
                    </div>
                    <div className="lifecycle-content">
                        <div className="lifecycle-label">
                            {stage.label}
                        </div>
                        <div className="lifecycle-group-label-small">{stage.group}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProjectLifecycleChevron;
