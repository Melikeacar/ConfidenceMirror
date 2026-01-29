import { useState } from 'react';
import { Mic, Upload, Play, Check, FileText, ChevronRight, BarChart2, ThumbsUp, AlertCircle, Lightbulb, Lock, Zap, Target, FileUp, FileType, AudioLines } from 'lucide-react';
import Recorder from './Recorder';
import OutlineInput from './OutlineInput';
import Results from './Results';
import { analyzePresentation } from './api';

function App() {
    const [view, setView] = useState('home'); // home, analyze, results
    const [analysisData, setAnalysisData] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [audioFile, setAudioFile] = useState(null);
    const [outlineText, setOutlineText] = useState('');
    const [outlineFile, setOutlineFile] = useState(null);

    const handleStartAnalysis = async () => {
        if (!audioFile) {
            alert("Please upload an audio file first.");
            return;
        }
        setIsAnalyzing(true);
        try {
            const results = await analyzePresentation(audioFile, outlineText, outlineFile);
            setAnalysisData(results);
            setView('results');
        } catch (error) {
            console.error("Analysis failed", error);
            alert("Analysis failed. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navigation */}
            <nav className="navbar">
                <div className="container nav-content">
                    <div className="nav-logo" onClick={() => setView('home')}>
                        <AudioLines className="logo-icon" />
                        <span className="logo-text">
                            ConfidenceMirror
                        </span>
                    </div>
                    <div className="nav-links">
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#how-it-works" className="nav-link">How it Works</a>
                        <a href="#pricing" className="nav-link">Pricing</a>
                    </div>
                    <div className="nav-cta">
                        <button className="btn-text">Sign In</button>
                        <button className="btn btn-primary text-sm" onClick={() => setView('analyze')}>Get Started</button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1">
                {view === 'home' && (
                    <>
                        <section className="hero-section animate-fade-in">
                            <div className="container hero-content">
                                <div className="hero-badge">
                                    <span className="badge-dot pulse-ring"></span>
                                    AI-Enhanced Speech & Presentation Coach
                                </div>
                                <h1 className="hero-title">
                                    Master Your Presentations<br />
                                    <span className="text-gradient">With Confidence</span>
                                </h1>
                                <p className="hero-subtitle">
                                    Get instant, AI-powered feedback on your speech delivery, content alignment, and presentation skills. Rehearse smarter, present better.
                                </p>
                                <div className="hero-buttons">
                                    <button onClick={() => setView('analyze')} className="btn btn-primary btn-large">
                                        Start Analyzing <span className="icon-spacer">✨</span>
                                    </button>
                                    <button className="btn btn-outline btn-large">
                                        <Play className="btn-icon" /> <span className="icon-spacer">Watch Demo</span>
                                    </button>
                                </div>

                                <div className="trusted-by">
                                    <p className="trusted-label">Trusted by professionals at</p>
                                    <div className="trusted-logos">
                                        <span>Google</span>
                                        <span>Microsoft</span>
                                        <span>Amazon</span>
                                        <span>Meta</span>
                                        <span>Tesla</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section id="how-it-works" className="features-section">
                            <div className="container">
                                <div className="section-header">
                                    <h2>How It Works</h2>
                                    <p>Four simple steps to transform your presentation skills</p>
                                </div>

                                <div className="steps-grid">
                                    {[
                                        { step: 1, title: 'Upload Your Recording', desc: 'Upload your presentation audio and provide your script or outline', icon: Upload },
                                        { step: 2, title: 'AI Analysis', desc: 'Our AI analyzes your speech patterns, delivery, and content alignment', icon: Mic },
                                        { step: 3, title: 'Get Insights', desc: 'Receive detailed metrics on pace, clarity, filler words, and more', icon: BarChart2 },
                                        { step: 4, title: 'Improve & Practice', desc: 'Apply feedback and track your progress over time', icon: Check },
                                    ].map((item) => (
                                        <div key={item.step} className="step-card">
                                            <div className="step-number">
                                                {item.step}
                                            </div>
                                            <div className="step-icon">
                                                <item.icon className="w-6 h-6" />
                                            </div>
                                            <h3>{item.title}</h3>
                                            <p>{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section id="features" className="sample-feedback-section">
                            <div className="container">
                                <div className="section-header">
                                    <h2>Sample Feedback</h2>
                                    <p>See the kind of actionable insights you'll receive</p>
                                </div>

                                <div className="metrics-grid">
                                    <div className="metric-card">
                                        <span className="metric-label">Speaking Rate</span>
                                        <span className="metric-value">145 WPM</span>
                                        <div className="metric-status good">Good</div>
                                    </div>
                                    <div className="metric-card">
                                        <span className="metric-label">Filler Words</span>
                                        <span className="metric-value">8 total</span>
                                        <div className="metric-status improve">Improve</div>
                                    </div>
                                    <div className="metric-card">
                                        <span className="metric-label">Pauses</span>
                                        <span className="metric-value">Well-timed</span>
                                        <div className="metric-status good">Good</div>
                                    </div>
                                    <div className="metric-card">
                                        <span className="metric-label">Alignment</span>
                                        <span className="metric-value">92%</span>
                                        <div className="metric-status good">Good</div>
                                    </div>
                                </div>
                                <div className="testimonial-block">
                                    <div className="testimonial-content">
                                        <div className="testimonial-quote">
                                            "I never realized I said 'um' every 5 seconds until I saw the data. Now my pitches are clean and hit the mark."
                                        </div>
                                        <div className="testimonial-author">
                                            <div className="author-avatar">EP</div>
                                            <div className="author-info">
                                                <span className="author-name">Elif P.</span>
                                                <span className="author-role">Product Manager</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="testimonial-stats">
                                        <div className="stat-pill before">
                                            <span className="pill-label">Before</span>
                                            <span className="pill-value">12 fillers/min</span>
                                        </div>
                                        <div className="arrow-icon">→</div>
                                        <div className="stat-pill after">
                                            <span className="pill-label">After</span>
                                            <span className="pill-value">0 fillers</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="feedback-grid">
                                    <div className="feedback-card strength">
                                        <div className="card-header">
                                            <div className="icon-badge green">
                                                <ThumbsUp className="w-5 h-5" />
                                            </div>
                                            <h3>Strengths</h3>
                                        </div>
                                        <ul className="feedback-list">
                                            <li className="feedback-item">
                                                <span className="bullet check">✓</span>
                                                Clear and confident opening statement
                                            </li>
                                            <li className="feedback-item">
                                                <span className="bullet check">✓</span>
                                                Good use of pauses for emphasis
                                            </li>
                                            <li className="feedback-item">
                                                <span className="bullet check">✓</span>
                                                Maintained consistent speaking pace
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="feedback-card improve">
                                        <div className="card-header">
                                            <div className="icon-badge amber">
                                                <AlertCircle className="w-5 h-5" />
                                            </div>
                                            <h3>Areas to Improve</h3>
                                        </div>
                                        <ul className="feedback-list">
                                            <li className="feedback-item">
                                                <span className="bullet dash">→</span>
                                                Reduce filler words like "um" and "uh" (8 instances)
                                            </li>
                                            <li className="feedback-item">
                                                <span className="bullet dash">→</span>
                                                Speak slightly slower during complex topics
                                            </li>
                                            <li className="feedback-item">
                                                <span className="bullet dash">→</span>
                                                Add more vocal variety in the middle section
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="feedback-card tip">
                                        <div className="card-header">
                                            <div className="icon-badge blue">
                                                <Lightbulb className="w-5 h-5" />
                                            </div>
                                            <h3>Tips</h3>
                                        </div>
                                        <ul className="feedback-list">
                                            <li className="feedback-item">
                                                <span className="bullet bulb">💡</span>
                                                Practice the transition between sections 2 and 3
                                            </li>
                                            <li className="feedback-item">
                                                <span className="bullet bulb">💡</span>
                                                Consider adding a brief pause before key statistics
                                            </li>
                                            <li className="feedback-item">
                                                <span className="bullet bulb">💡</span>
                                                Your conclusion was strong - maintain that energy throughout
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section id="pricing" className="pricing-section">
                            <div className="container">
                                <div className="section-header">
                                    <h2>Simple, Transparent Pricing</h2>
                                    <p>Choose the plan that fits your needs. No hidden fees.</p>
                                </div>

                                <div className="pricing-grid">
                                    {/* Free Plan */}
                                    <div className="pricing-card">
                                        <div className="pricing-header">
                                            <h3>Free</h3>
                                            <p>Perfect for trying out ConfidenceMirror</p>
                                        </div>
                                        <div className="pricing-price">
                                            <span className="currency">$</span>
                                            <span className="amount">0</span>
                                            <span className="period">/forever</span>
                                        </div>
                                        <button className="btn btn-outline btn-full">Get Started</button>
                                        <ul className="pricing-features">
                                            <li><Check className="feature-icon" /> 3 analyses per month</li>
                                            <li><Check className="feature-icon" /> Basic speech metrics</li>
                                            <li><Check className="feature-icon" /> Transcript access</li>
                                            <li><Check className="feature-icon" /> Email support</li>
                                        </ul>
                                    </div>

                                    {/* Pro Plan */}
                                    <div className="pricing-card popular">
                                        <div className="popular-badge">Most Popular</div>
                                        <div className="pricing-header">
                                            <h3>Pro</h3>
                                            <p>For professionals who present regularly</p>
                                        </div>
                                        <div className="pricing-price">
                                            <span className="currency">$</span>
                                            <span className="amount">29</span>
                                            <span className="period">/per month</span>
                                        </div>
                                        <button className="btn btn-primary btn-full">Start Free Trial</button>
                                        <ul className="pricing-features">
                                            <li><Check className="feature-icon" /> Unlimited analyses</li>
                                            <li><Check className="feature-icon" /> Advanced metrics & insights</li>
                                            <li><Check className="feature-icon" /> Content alignment analysis</li>
                                            <li><Check className="feature-icon" /> Progress tracking</li>
                                            <li><Check className="feature-icon" /> Priority support</li>
                                            <li><Check className="feature-icon" /> Export reports</li>
                                        </ul>
                                    </div>

                                    {/* Team Plan */}
                                    <div className="pricing-card">
                                        <div className="pricing-header">
                                            <h3>Team</h3>
                                            <p>For teams and organizations</p>
                                        </div>
                                        <div className="pricing-price">
                                            <span className="currency">$</span>
                                            <span className="amount">99</span>
                                            <span className="period">/per month</span>
                                        </div>
                                        <button className="btn btn-outline btn-full">Contact Sales</button>
                                        <ul className="pricing-features">
                                            <li><Check className="feature-icon" /> Everything in Pro</li>
                                            <li><Check className="feature-icon" /> Up to 10 team members</li>
                                            <li><Check className="feature-icon" /> Team analytics dashboard</li>
                                            <li><Check className="feature-icon" /> Custom feedback templates</li>
                                            <li><Check className="feature-icon" /> API access</li>
                                            <li><Check className="feature-icon" /> Dedicated support</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {view === 'analyze' && (
                    <div className="analyze-page animate-fade-in">
                        <section className="analyze-header-section">
                            <div className="container">
                                <h1>Analyze Your Presentation</h1>
                                <p>Upload your audio recording and provide your presentation outline to receive AI-powered feedback</p>
                            </div>
                        </section>

                        <div className="container analyze-content">
                            <div className="analyze-card">
                                <div className="form-group">
                                    <h3 className="section-label">Upload Audio Recording</h3>
                                    <Recorder onFileChange={setAudioFile} selectedFile={audioFile} />
                                </div>

                                <div className="form-group">
                                    <h3 className="section-label">Presentation Script or Outline</h3>
                                    <p className="section-sublabel">Paste your script or upload your PPTX slides</p>

                                    <div className="script-input-container">
                                        <div className="script-text-area">
                                            <OutlineInput value={outlineText} onChange={setOutlineText} />
                                            <div className="char-count-static">{outlineText.length} chars</div>
                                        </div>

                                        <div className="script-divider">
                                            <span>OR</span>
                                        </div>

                                        <div className="script-file-upload">
                                            <label className={`ppt-upload-zone ${outlineFile ? 'has-file' : ''}`}>
                                                <input
                                                    type="file"
                                                    accept=".pptx,.pdf"
                                                    className="hidden-input"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            setOutlineFile(e.target.files[0]);
                                                            // Clear text if file is selected to avoid confusion
                                                            setOutlineText('');
                                                        }
                                                    }}
                                                />
                                                <div className="ppt-icon-wrapper">
                                                    {outlineFile ? <Check className="w-8 h-8 text-green-500" /> : <FileUp className="w-8 h-8" />}
                                                </div>
                                                <span className="ppt-upload-text">
                                                    {outlineFile ? outlineFile.name : "Upload Presentation"}
                                                </span>
                                                <span className="ppt-upload-subtext">
                                                    {outlineFile ? `${(outlineFile.size / 1024).toFixed(1)} KB` : ".PPTX or .PDF"}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                    <p className="input-helper-text mt-2">This helps our AI analyze how well your delivery aligns with your intended content.</p>
                                </div>

                                <button
                                    className={`btn btn-primary btn-full btn-lg ${isAnalyzing ? 'loading' : ''}`}
                                    onClick={handleStartAnalysis}
                                    disabled={!audioFile || isAnalyzing || (!outlineText && !outlineFile)}
                                >
                                    {isAnalyzing ? 'Analyzing...' : 'Analyze Presentation'}
                                </button>
                            </div>

                            <div className="trust-badges">
                                <div className="badge-item">
                                    <div className="badge-icon icon-orange">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div className="badge-text">
                                        <strong>Secure</strong>
                                        <span>Your data is encrypted and private</span>
                                    </div>
                                </div>
                                <div className="badge-item">
                                    <div className="badge-icon icon-yellow">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div className="badge-text">
                                        <strong>Fast</strong>
                                        <span>Results in under 2 minutes</span>
                                    </div>
                                </div>
                                <div className="badge-item">
                                    <div className="badge-icon icon-blue">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <div className="badge-text">
                                        <strong>Accurate</strong>
                                        <span>AI-powered analysis</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'results' && analysisData && (
                    <div className="container py-12 animate-fade-in">
                        <Results data={analysisData} onBack={() => setView('analyze')} />
                    </div>
                )}
            </main>

            <footer className="py-8 text-center text-gray-400 text-sm">
                &copy; 2024 ConfidenceMirror. All rights reserved.
            </footer>
        </div>
    );
}

export default App;
