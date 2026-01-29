import { ArrowLeft, Clock, Mic, Pause, FileCheck, ThumbsUp, AlertTriangle, Lightbulb } from 'lucide-react';

function Results({ data, onBack }) {
    const metrics = [
        { label: 'Speaking Rate', value: `${data.wpm} WPM`, status: 'Good', statusColor: 'bg-green-100 text-green-700', icon: Clock },
        { label: 'Filler Words', value: `${data.fillerCount} total`, status: 'Improve', statusColor: 'bg-yellow-100 text-yellow-700', icon: Mic },
        { label: 'Pauses', value: data.pauseScore, status: 'Good', statusColor: 'bg-green-100 text-green-700', icon: Pause },
        { label: 'Alignment', value: `${data.alignmentScore}%`, status: 'Good', statusColor: 'bg-green-100 text-green-700', icon: FileCheck },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold">Analysis Results</h1>
                    <p className="text-gray-500">Here's how you performed in your recording</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, i) => (
                    <div key={i} className="card flex flex-col items-center text-center p-6">
                        <span className="text-gray-500 text-sm font-medium mb-4">{metric.label}</span>
                        <span className="text-3xl font-bold text-gray-900 mb-4">{metric.value}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${metric.statusColor}`}>
                            {metric.status}
                        </span>
                    </div>
                ))}
            </div>

            {/* Detailed Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {/* Strengths */}
                <div className="card border-l-4 border-l-green-500 bg-green-50/30">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                            <ThumbsUp className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Strengths</h3>
                    </div>
                    <ul className="space-y-4">
                        {data.strengths.map((item, i) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-700">
                                <span className="text-green-500 mt-0.5">✓</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Areas to Improve */}
                <div className="card border-l-4 border-l-amber-500 bg-amber-50/30">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Areas to Improve</h3>
                    </div>
                    <ul className="space-y-4">
                        {data.improvements.map((item, i) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-700">
                                <span className="text-amber-500 font-bold mt-0.5">–</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Tips */}
                <div className="card border-l-4 border-l-blue-500 bg-blue-50/30">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Lightbulb className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Tips</h3>
                    </div>
                    <ul className="space-y-4">
                        {data.tips.map((item, i) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-700">
                                <span className="text-blue-500 mt-0.5">💡</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Results;
