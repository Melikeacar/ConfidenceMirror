// Upload is handled directly via analyzePresentation in the real API
export const uploadAudio = async (file) => {
    console.log("File ready for upload:", file.name);
    return Promise.resolve({ success: true });
};

// Helper to calculate alignment score from backend data
function calculateAlignmentScore(alignment) {
    if (!alignment || !alignment.items || alignment.items.length === 0) return 0;

    const totalSegments = alignment.items.length;
    const offTopicCount = alignment.off_topic_segments ? alignment.off_topic_segments.length : 0;
    const onTopicCount = totalSegments - offTopicCount;

    return Math.round((onTopicCount / totalSegments) * 100);
}

export const analyzePresentation = async (audioFile, outlineText, outlineFile) => {
    console.log("Analyzing...", { audioFile, outlineText, outlineFile });

    const formData = new FormData();
    formData.append('audio', audioFile);
    if (outlineText) formData.append('outline_text', outlineText);
    if (outlineFile) formData.append('outline_file', outlineFile);

    // DETERMINE ENDPOINT: Use PRO version if PPTX file is uploaded
    // Robust check for PPTX (extension OR mime type)
    const fileName = outlineFile ? outlineFile.name.toLowerCase() : '';
    const fileType = outlineFile ? outlineFile.type : '';

    const isPptx = fileName.endsWith('.pptx') ||
        fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

    const endpoint = isPptx
        ? 'http://localhost:8000/api/analyze-pro'
        : 'http://localhost:8000/api/analyze';

    console.log(`File: ${fileName}, Type: ${fileType}, IsPPTX: ${isPptx}, Endpoint: ${endpoint}`);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        // Map backend response to frontend expected format
        return {
            wpm: data.metrics.wpm,
            fillerCount: data.metrics.filler_count,
            pauseScore: "N/A", // Backend currently doesn't provide this metric
            alignmentScore: calculateAlignmentScore(data.alignment),
            strengths: data.feedback.strengths,
            improvements: data.feedback.improvements,
            tips: data.feedback.tips.map(t => `${t.section}: ${t.tip}`),
            // Pass through the new slide alignment data if it exists
            slide_alignment: data.slide_alignment,
            // Debug info
            debug: {
                isPptx,
                fileName,
                hasSlideAlignment: !!data.slide_alignment
            }
        };
    } catch (error) {
        console.error("Analysis failed:", error);
        throw error;
    }
};

export const generateSlideDetails = async (selectedSlideIds, contextData) => {
    // contextData contains: { transcript, slides, outlineText? }
    const payload = {
        transcript: contextData.transcript?.text || "",
        slides: contextData.slides.map(s => ({
            slide_number: s.slide_number,
            bullets: s.bullets
        })),
        selected_slide_numbers: Array.from(selectedSlideIds)
    };

    console.log("Generating details for slides...", payload);

    // SIMULATION: In a real app, this would POST to /api/generate-suggestions
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Suggestions generated!");
            resolve({ success: true, count: selectedSlideIds.size });
        }, 2000);
    });
};
