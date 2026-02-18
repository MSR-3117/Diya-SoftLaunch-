import React from 'react';
import '../../css/box-loader.css';

const BoxLoader = () => {
    // Map over an array to avoid repeating the JSX for each box.
    const boxes = [...Array(8).keys()];

    return (
        <div className="loader">
            {boxes.map(i => (
                <div key={i} className={`box box${i}`}>
                    <div></div>
                </div>
            ))}
            <div className="ground">
                <div></div>
            </div>
        </div>
    );
};

export default BoxLoader;
