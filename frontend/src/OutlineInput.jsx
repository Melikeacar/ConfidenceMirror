function OutlineInput({ value, onChange }) {
    return (
        <div className="outline-input-wrapper h-full">
            <textarea
                className="outline-textarea"
                placeholder="Paste your presentation script, outline, or key points here..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

export default OutlineInput;
