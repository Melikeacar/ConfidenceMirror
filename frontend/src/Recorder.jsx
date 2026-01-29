import { Upload, FileAudio, X } from 'lucide-react';
import { useCallback, useState } from 'react';

function Recorder({ onFileChange, selectedFile }) {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileChange(e.dataTransfer.files[0]);
        }
    }, [onFileChange]);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            onFileChange(e.target.files[0]);
        }
    };

    return (
        <div
            className={`recorder-dropzone ${dragActive ? 'active' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input
                type="file"
                id="file-upload"
                className="hidden-input"
                accept="audio/*"
                onChange={handleChange}
            />

            {selectedFile ? (
                <div className="file-info animate-fade-in">
                    <div className="file-icon-wrapper">
                        <FileAudio className="w-8 h-8" />
                    </div>
                    <p className="file-name">{selectedFile.name}</p>
                    <p className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button
                        onClick={() => onFileChange(null)}
                        className="btn-remove"
                    >
                        <X className="w-4 h-4" /> Remove File
                    </button>
                </div>
            ) : (
                <label htmlFor="file-upload" className="dropzone-label">
                    <div className="upload-icon-wrapper">
                        <Upload className="w-6 h-6" />
                    </div>
                    <p className="dropzone-text-main">Drag and drop your audio file here, or click to browse</p>
                    <p className="dropzone-text-sub">Supports MP3, WAV, M4A (Max 100MB)</p>
                    <div className="choose-file-btn">Choose File</div>
                </label>
            )}
        </div>
    );
}

export default Recorder;
