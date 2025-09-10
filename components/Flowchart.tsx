import React from 'react';
import { QCC_STEPS, IP_STEPS } from '../constants';
import { GeneratorType } from '../types';
import { ArrowRightIcon } from './icons';

const stepMap: Record<GeneratorType, { steps: string[] }> = {
    QCC: { steps: QCC_STEPS },
    IP: { steps: IP_STEPS },
};

interface FlowchartProps {
    generatorType: GeneratorType;
}

const Flowchart: React.FC<FlowchartProps> = ({ generatorType }) => {
    const { steps } = stepMap[generatorType];

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <div className="overflow-x-auto pb-2">
                <div className="flex items-start justify-between min-w-[900px]">
                    {steps.map((step, index) => (
                        <React.Fragment key={step}>
                            <div className="flex flex-col items-center text-center w-28 flex-shrink-0">
                                <div className="flex items-center justify-center w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full mb-2 font-bold text-2xl">
                                    {index + 1}
                                </div>
                                <span className="text-sm font-semibold text-gray-700 leading-tight">{step}</span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="flex-1 flex justify-center pt-5 px-1">
                                   <ArrowRightIcon className="w-6 h-6 text-gray-300" />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Flowchart;