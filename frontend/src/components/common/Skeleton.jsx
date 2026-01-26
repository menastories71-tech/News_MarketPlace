import React from 'react';

const Skeleton = ({ className, variant = 'rect', width, height }) => {
    const baseClasses = 'animate-pulse bg-gray-200';

    let variantClasses = 'rounded';
    if (variant === 'circle') {
        variantClasses = 'rounded-full';
    } else if (variant === 'text') {
        variantClasses = 'rounded h-4 mb-2';
    }

    const style = {
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses} ${className || ''}`}
            style={style}
        ></div>
    );
};

export default Skeleton;
