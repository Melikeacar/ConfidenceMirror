import React, { useMemo, useState, useEffect, useRef } from "react";
import {
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Layers,
    Mic,
    ChevronRight,
    Info,
    Zap,
    Play,
    ArrowLeft,
    X,
    Lightbulb,
} from "lucide-react";

import { generateSlideDetails } from "./api";

/**
 * ✅ Tailwind test bandı (istersen true yap)
 * - true: üstte kırmızı bant çıkar (Tailwind çalışıyor mu görürsün)
 * - false: normal
 */
const SHOW_TW_TEST = false;

const MetricCard = ({
    title,
    value,
    description,
    status,
    icon: Icon,
    isStar = false,
    onStarClick,
}) => {
    const getStatusColor = () => {
        if (status === "good") return "text-emerald-500 bg-emerald-50";
        if (status === "warning") return "text-amber-500 bg-amber-50";
        if (status === "danger") return "text-rose-500 bg-rose-50";
        return "text-slate-500 bg-slate-50";
    };

    const getCardStyle = () => {
        if (isStar) return "border-pink-200 bg-pink-50/30";
        return "border-[#0f172a14] bg-white";
    };

    return (
        <div
            className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 ${getCardStyle()} relative overflow-hidden group`}
        >
            {isStar && (
                <div className="absolute top-0 right-0 p-2">
                    <div className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-md flex items-center gap-1 uppercase tracking-wider">
                        <Zap size={10} fill="currentColor" /> Pro Feature
                    </div>
                </div>
            )}

            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${getStatusColor()}`}>
                    <Icon size={24} />
                </div>
                {status === "warning" && (
                    <AlertCircle className="text-amber-400" size={20} />
                )}
                {status === "good" && (
                    <CheckCircle2 className="text-emerald-400" size={20} />
                )}
            </div>

            <div className="space-y-1">
                <h3 className="text-sm font-medium text-slate-500 flex items-center gap-1">
                    {title}
                    <Info size={14} className="opacity-40 cursor-help" />
                </h3>

                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{value}</span>
                </div>

                <p
                    className={`text-sm font-medium mt-2 ${status === "danger" ? "text-rose-600" : "text-slate-600"
                        }`}
                >
                    — {description}
                </p>
            </div>

            {isStar && (
                <div className="mt-4 pt-4 border-t border-slate-50">
                    <button
                        type="button"
                        onClick={onStarClick}
                        className="text-xs font-semibold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                        NASIL DÜZELTİRİM? <ChevronRight size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

// helpers
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function tempoDesc(wpm) {
    if (wpm < 95) return "Biraz yavaş; kritik yerlerde hızlanabilirsin.";
    if (wpm <= 150) return "Sakin ve dengeli bir tempo.";
    return "Biraz hızlı; netlik için biraz yavaşlayabilirsin.";
}

function tempoStatus(wpm) {
    if (wpm < 95) return "warning";
    if (wpm <= 150) return "good";
    return "warning";
}

function alignmentStatus(score) {
    if (score >= 80) return "good";
    if (score >= 50) return "warning";
    return "danger";
}

function alignmentDesc(score) {
    if (score >= 80) return "Slaytlarınla anlatımın oldukça uyumlu.";
    if (score >= 50) return "Kısmen uyumlu; bazı yerlerde kaymalar var.";
    return "⚠️ Hikayeniz slaytlarınızla eşleşmiyor.";
}

// fillerCount ile “enerji” türetme (basit)
function energyScoreFromFillers(fillerCount) {
    const score = 100 - Number(fillerCount || 0) * 6;
    return clamp(Math.round(score), 40, 98);
}

function energyStatus(score) {
    if (score >= 80) return "good";
    if (score >= 60) return "warning";
    return "danger";
}

function energyDesc(score) {
    if (score >= 80) return "İzleyiciyi elinde tutan bir ton.";
    if (score >= 60) return "Genel olarak iyi, ama daha canlı vurgu eklenebilir.";
    return "Vurgu/enerji düşük; ana noktalarda güçlendirebilirsin.";
}

function confidenceScore({ alignmentScore, fillerCount, wpm }) {
    const a = clamp(Number(alignmentScore || 0), 0, 100);
    const fPenalty = clamp(Number(fillerCount || 0) * 3, 0, 25);
    const w = Number(wpm || 0);
    const tempoPenalty = w < 95 ? 8 : w > 165 ? 8 : 0;
    return clamp(Math.round(a * 0.7 + 30 - fPenalty - tempoPenalty), 0, 100);
}

const SlideSkeletonCard = () => {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between p-4 border-b border-slate-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                    <div className="h-6 w-48 bg-slate-200 rounded"></div>
                </div>
                <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
            </div>

            {/* Content Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-50">
                {/* Left Skeleton */}
                <div className="p-6 space-y-4">
                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                    <div className="h-7 w-3/4 bg-slate-200 rounded"></div>
                    <div className="space-y-2 pt-2">
                        <div className="h-4 w-24 bg-slate-200 rounded"></div>
                        <div className="h-4 w-full bg-slate-200 rounded"></div>
                        <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
                        <div className="h-4 w-4/6 bg-slate-200 rounded"></div>
                    </div>
                </div>

                {/* Right Skeleton */}
                <div className="p-6 bg-slate-50/50 space-y-4">
                    <div className="h-6 w-40 bg-slate-200 rounded mb-4"></div>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-300 mt-2"></div>
                            <div className="h-4 w-full bg-slate-200 rounded"></div>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-300 mt-2"></div>
                            <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-300 mt-2"></div>
                            <div className="h-4 w-4/5 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Skeleton */}
            <div className="h-12 bg-slate-100 p-4"></div>
        </div>
    );
};

const SlideResultCard = ({ slide, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasLongContent = slide.bullets && slide.bullets.length > 150;

    const getStatusColor = (status) => {
        if (status === 'good') return 'bg-emerald-100 text-emerald-700';
        if (status === 'partial') return 'bg-amber-100 text-amber-700';
        return 'bg-rose-100 text-rose-700';
    };

    const getStatusText = (status) => {
        if (status === 'missing') return 'Düşük Uyum';
        if (status === 'good') return 'Yüksek Uyum';
        if (status === 'partial') return 'Kısmi Uyum';
        return status;
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-50">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">
                        {index + 1}
                    </span>
                    Slayt Analizi & Senaryo Önerisi
                </h3>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(slide.status)}`}>
                    {getStatusText(slide.status)}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-50">
                {/* Left: Slide Info */}
                <div className="p-6">
                    <div className="mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">SLAYT BAŞLIĞI</span>
                        <h4 className="font-bold text-slate-900 text-lg mt-1">
                            {slide.title || "İsimsiz Slayt"}
                        </h4>
                    </div>

                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">İÇERİK ÖZETİ</span>
                        <div className="text-sm text-slate-600 leading-relaxed italic relative">
                            {hasLongContent && !isExpanded
                                ? `${slide.bullets.substring(0, 150)}...`
                                : (slide.bullets || "İçerik tespit edilemedi.")
                            }
                            {hasLongContent && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-indigo-600 font-semibold hover:underline ml-1"
                                >
                                    {isExpanded ? "Daha az" : "Daha fazla"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Talking Points */}
                <div className="p-6 bg-slate-50/50">
                    <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                        <Zap size={18} className="text-indigo-600" />
                        Önerilen Talking Points
                    </h4>

                    {slide.talking_points && slide.talking_points.length > 0 ? (
                        <ul className="space-y-3">
                            {slide.talking_points.map((tp, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                                    <span>{tp}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-sm text-slate-400 italic">
                            Bu slayt için özel bir öneri bulunmuyor.
                        </div>
                    )}
                </div>
            </div>

            {/* Footer: Suggestion Strip (Purple) */}
            {slide.needs_suggestion && (
                <div className="bg-indigo-600 text-white p-4 flex items-start md:items-center gap-3 text-sm">
                    <Lightbulb size={18} className="text-indigo-200 shrink-0 mt-0.5 md:mt-0" />
                    <span className="font-medium opacity-95">
                        Öneri: Konuşmanızı bu maddeler etrafında şekillendirerek uyumu artırabilirsiniz.
                    </span>
                </div>
            )}
        </div>
    );
};

const Results = ({ data, onBack, audioFile }) => {
    const [activeTab, setActiveTab] = useState("summary");
    const [showPlayer, setShowPlayer] = useState(false);

    // State Machine: 'closed' | 'selecting' | 'loading' | 'ready' | 'error'
    const [slideAnalysisStatus, setSlideAnalysisStatus] = useState("closed");
    const [selectedSlideIds, setSelectedSlideIds] = useState(new Set());
    const [slides, setSlides] = useState(data?.slide_alignment?.slides || []);
    const resultsRef = useRef(null);

    // Auto-scroll when results are ready
    useEffect(() => {
        if (slideAnalysisStatus === 'ready' && resultsRef.current) {
            setTimeout(() => {
                resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [slideAnalysisStatus]);

    // ✅ URL oluştur ve modal kapanınca temizle
    const audioUrl = useMemo(() => {
        if (!audioFile) return null;
        return URL.createObjectURL(audioFile);
    }, [audioFile]);

    useEffect(() => {
        // Update slides if data changes
        if (data?.slide_alignment?.slides) {
            setSlides(data.slide_alignment.slides);
        }
    }, [data]);

    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const mapped = useMemo(() => {
        const wpm = Number(data?.wpm ?? 0);
        const fillerCount = Number(data?.fillerCount ?? 0);
        const alignment = Number(data?.alignmentScore ?? 0);

        const energy = energyScoreFromFillers(fillerCount);
        const conf = confidenceScore({ alignmentScore: alignment, fillerCount, wpm });

        return {
            wpm,
            speakingTempoDesc: tempoDesc(wpm),
            speakingTempoStatus: tempoStatus(wpm),

            alignmentPercent: alignment,
            alignmentDesc: alignmentDesc(alignment),
            alignmentStatus: alignmentStatus(alignment),

            energyPercent: energy,
            energyDesc: energyDesc(energy),
            energyStatus: energyStatus(energy),

            confidenceScore: conf,
            confidenceText:
                alignment < 50
                    ? "Genel duruşun iyi; ancak slayt–anlatım kopukluğu izleyicinin odağını dağıtabilir."
                    : "Genel olarak güçlü bir duruşun var. Küçük dokunuşlarla daha da netleşebilir.",

            strengths: Array.isArray(data?.strengths) ? data.strengths : [],
            improvements: Array.isArray(data?.improvements) ? data.improvements : [],
            tips: Array.isArray(data?.tips) ? data.tips : [],
            fillerCount,
            pauseScore: data?.pauseScore ?? "N/A",
            // We use local state 'slides' instead of mapped.slideAlignment
            debug: data?.debug || {}
        };
    }, [data]);

    const handlePlayRecording = () => {
        if (!audioFile) {
            alert("Audio file bulunamadı. Analiz sayfasına dönüp tekrar yükleyebilir misin?");
            return;
        }
        setShowPlayer(true);
    };

    const handleFixAlignment = () => setActiveTab("alignment");

    const handleSyncWithSlides = () => {
        // If no slides are available, warn user
        const hasSlides = slides && slides.length > 0;

        if (!hasSlides) {
            const debugInfo = mapped.debug || {};
            alert(`Slide data is missing.\n\nDebug Info:\nFile: ${debugInfo.fileName || 'N/A'}\nDetected as PPTX: ${debugInfo.isPptx ? 'Yes' : 'No'}\n\nPlease ensure you uploaded a valid .pptx file.`);
            return;
        }

        // Switch to selecting state
        setSlideAnalysisStatus("selecting");
        // Pre-select all slides by default? Or none? Let's select all initially for convenience.
        // const allIds = new Set(slides.map(s => s.slide_number));
        // setSelectedSlideIds(allIds);
    };

    const toggleSlideSelection = (slideNumber) => {
        const newSet = new Set(selectedSlideIds);
        if (newSet.has(slideNumber)) {
            newSet.delete(slideNumber);
        } else {
            newSet.add(slideNumber);
        }
        setSelectedSlideIds(newSet);
    };

    const handleAnalyzeSelected = async () => {
        if (selectedSlideIds.size === 0) {
            alert("Lütfen en az bir slayt seçin.");
            return;
        }
        setSlideAnalysisStatus("loading");

        try {
            // Prepare context data for the API
            const contextData = {
                transcript: data.transcript,
                slides: slides
            };

            // Call the API (simulated for now)
            await generateSlideDetails(selectedSlideIds, contextData);

            // On success, show results
            setSlideAnalysisStatus("ready");
        } catch (error) {
            console.error("Analysis error:", error);
            // Optional: set error state
            alert("Analiz sırasında bir hata oluştu.");
            setSlideAnalysisStatus("closed"); // or stay in selecting
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F8FC] p-4 md:p-8 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto">
                {SHOW_TW_TEST && (
                    <div className="bg-red-500 text-white p-4 rounded-xl mb-6 font-bold">
                        TAILWIND ÇALIŞIYOR
                    </div>
                )}

                {/* Top Bar */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold"
                    >
                        <ArrowLeft size={18} /> Back to Analysis
                    </button>

                    <div className="text-xs text-slate-400">AI ANALYSIS COMPLETE</div>
                </div>

                {/* Header */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="hero-title text-slate-900" style={{ fontSize: '2.5rem', marginBottom: '1rem', marginTop: 0 }}>
                            Your Performance Report
                        </h1>
                        <p className="text-slate-500 text-lg">
                            Great job! We analyzed your delivery style and content alignment. Here’s your breakdown.
                        </p>
                    </div>

                    <div className="flex justify-start md:justify-end">
                        <button
                            onClick={handlePlayRecording}
                            className="flex items-center gap-2 bg-[#0B1220] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-slate-200/50"
                        >
                            <Play size={18} fill="currentColor" /> Kaydı İzle
                        </button>
                    </div>
                </header>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full">
                    <MetricCard
                        title="Speaking Tempo"
                        value={`${mapped.wpm || 0} WPM`}
                        description={mapped.speakingTempoDesc}
                        status={mapped.speakingTempoStatus}
                        icon={Mic}
                    />

                    <MetricCard
                        isStar
                        title="Slide Alignment"
                        value={`%${mapped.alignmentPercent}`}
                        description={mapped.alignmentDesc}
                        status={mapped.alignmentStatus}
                        icon={Layers}
                        onStarClick={handleFixAlignment}
                    />

                    <MetricCard
                        title="Emphasis & Energy"
                        value={`%${mapped.energyPercent}`}
                        description={mapped.energyDesc}
                        status={mapped.energyStatus}
                        icon={Zap}
                    />
                </div>

                {/* Deep Dive */}
                <div className="bg-white rounded-3xl shadow-sm border border-[#0f172a14] overflow-hidden">
                    <div className="p-1 flex gap-1">
                        <button
                            onClick={() => setActiveTab("summary")}
                            className={`px-6 py-3 text-sm font-semibold rounded-2xl transition-all ${activeTab === "summary"
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-slate-500 hover:bg-slate-50"
                                }`}
                        >
                            Summary Analysis
                        </button>
                        <button
                            onClick={() => setActiveTab("alignment")}
                            className={`px-6 py-3 text-sm font-semibold rounded-2xl transition-all ${activeTab === "alignment"
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-slate-500 hover:bg-slate-50"
                                }`}
                        >
                            Alignment Details
                        </button>
                    </div>

                    <div className="p-8">
                        {activeTab === "summary" ? (
                            <div className="space-y-6">
                                <div className="flex items-start gap-4 p-5 bg-indigo-50/50 rounded-2xl">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-1">
                                            Confidence Score: %{mapped.confidenceScore}
                                        </h4>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            {mapped.confidenceText}
                                        </p>

                                        <div className="mt-3 text-xs text-slate-500">
                                            Extra: fillers <b>{mapped.fillerCount}</b>, pauses{" "}
                                            <b>{mapped.pauseScore}</b>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-5 bg-slate-50 rounded-2xl">
                                        <h5 className="font-bold text-slate-800 mb-2">Core Strengths</h5>
                                        {mapped.strengths.length === 0 ? (
                                            <div className="text-sm text-slate-500">
                                                No strengths returned by API.
                                            </div>
                                        ) : (
                                            <ul className="space-y-2 text-sm text-slate-600">
                                                {mapped.strengths.map((s, idx) => (
                                                    <li key={idx} className="flex items-center gap-2">
                                                        ✅ {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="p-5 bg-rose-50/50 rounded-2xl">
                                        <h5 className="font-bold text-slate-800 mb-2">Areas to Improve</h5>
                                        {mapped.improvements.length === 0 ? (
                                            <div className="text-sm text-slate-500">
                                                No improvements returned by API.
                                            </div>
                                        ) : (
                                            <ul className="space-y-2 text-sm text-slate-600">
                                                {mapped.improvements.map((s, idx) => (
                                                    <li key={idx} className="flex items-center gap-2 text-rose-600">
                                                        ❌ {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                {mapped.tips.length > 0 && (
                                    <div className="p-5 bg-amber-50/50 rounded-2xl">
                                        <h5 className="font-bold text-slate-800 mb-2">Tips</h5>
                                        <ul className="space-y-2 text-sm text-slate-600">
                                            {mapped.tips.map((t, idx) => (
                                                <li key={idx} className="flex items-center gap-2">
                                                    💡 {t}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // ALIGNMENT TAB CONTENT
                            // ALIGNMENT TAB CONTENT
                            <div className="space-y-6">
                                {slideAnalysisStatus === 'closed' && (
                                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-2 animate-pulse">
                                            <Layers size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">Why Alignment Matters?</h3>
                                        <p className="text-slate-500 max-w-md mx-auto">
                                            ConfidenceMirror compares your spoken keywords with your outline in real-time. Low alignment suggests
                                            your speech is drifting away from the intended content.
                                        </p>
                                        <button
                                            onClick={handleSyncWithSlides}
                                            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
                                        >
                                            Sync With Slides & See Suggestions
                                        </button>
                                        {!mapped.slideAlignment && (
                                            <p className="text-xs text-slate-400 mt-2">(Requires .pptx upload)</p>
                                        )}
                                    </div>
                                )}

                                {slideAnalysisStatus === 'selecting' && (
                                    <div className="animate-fade-in">
                                        <div className="flex flex-col gap-4 mb-6">
                                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                <Layers className="text-indigo-600" size={20} />
                                                Slayt Seç
                                            </h3>

                                            <div className="flex items-center justify-between">
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => {
                                                            const allIds = new Set(slides.map(s => s.slide_number));
                                                            setSelectedSlideIds(allIds);
                                                        }}
                                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
                                                    >
                                                        Tümünü seç
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedSlideIds(new Set())}
                                                        className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline"
                                                    >
                                                        Temizle
                                                    </button>
                                                </div>
                                                <span className="text-xs text-slate-400">
                                                    {selectedSlideIds.size} / {slides.length} Seçildi
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 mb-6">
                                            {slides.map((slide) => {
                                                const isSelected = selectedSlideIds.has(slide.slide_number);
                                                return (
                                                    <div
                                                        key={slide.slide_number}
                                                        onClick={() => toggleSlideSelection(slide.slide_number)}
                                                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 group
                                                        ${isSelected
                                                                ? 'border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500 shadow-md'
                                                                : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'}`}
                                                    >
                                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-colors
                                                            ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                                                            {isSelected && <CheckCircle2 size={14} />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                                    Slide {slide.slide_number}
                                                                </span>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold
                                                                    ${slide.status === 'covered' ? 'bg-emerald-100 text-emerald-700' :
                                                                        slide.status === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                                                    {slide.status}
                                                                </span>
                                                            </div>
                                                            <h4 className={`font-bold text-lg mb-1 transition-colors ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                                                                {slide.title || "Untitled Slide"}
                                                            </h4>
                                                            <p className="text-sm text-slate-500 line-clamp-1 italic">
                                                                {slide.bullets || "No content detected."}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                            <button
                                                onClick={() => setSlideAnalysisStatus('closed')}
                                                className="flex-1 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-bold transition-all"
                                            >
                                                Vazgeç
                                            </button>
                                            <button
                                                onClick={handleAnalyzeSelected}
                                                disabled={selectedSlideIds.size === 0}
                                                className={`flex-[2] py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg
                                                    ${selectedSlideIds.size === 0
                                                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                                        : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl'
                                                    }`}
                                            >
                                                {selectedSlideIds.size === 0 ? "En az 1 slayt seç" : "Analizi Başlat"} <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {slideAnalysisStatus === 'loading' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                                Analyzing Slides...
                                            </h3>
                                            <p className="text-slate-500 text-sm">Generating AI improvements for your selected slides.</p>
                                        </div>
                                        {/* Render 2 Skeletons */}
                                        <SlideSkeletonCard />
                                        <SlideSkeletonCard />
                                    </div>
                                )}

                                {slideAnalysisStatus === 'ready' && (
                                    <div ref={resultsRef} className="animate-fade-in scroll-mt-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                <Layers className="text-indigo-600" size={20} />
                                                Analysis Results
                                            </h3>
                                            <button
                                                onClick={() => setSlideAnalysisStatus('selecting')}
                                                className="text-sm text-slate-500 hover:text-slate-900 underline"
                                            >
                                                Change Selection
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            {slides.map((slide, index) => {
                                                if (!selectedSlideIds.has(slide.slide_number)) return null;
                                                return <SlideResultCard key={slide.slide_number} slide={slide} index={index} />;
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Player Modal */}
            {
                showPlayer && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                                <div className="font-bold text-slate-900">Recording</div>
                                <button
                                    onClick={() => setShowPlayer(false)}
                                    className="p-2 rounded-lg hover:bg-slate-50 text-slate-600"
                                    aria-label="Close"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-5">
                                {audioUrl ? (
                                    <audio controls className="w-full">
                                        <source src={audioUrl} />
                                    </audio>
                                ) : (
                                    <div className="text-sm text-slate-600">Audio bulunamadı.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Results;
