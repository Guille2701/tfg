

const AccessibilityButton = () => {
    return (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2">
            <button
                className="w-14 h-14 bg-[#dff0e8] shadow-xl rounded-full border-2 border-primary text-primary flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                title="Aumentar tamaño de letra"
            >
                <span className="material-icons">text_fields</span>
            </button>
        </div>
    );
};

export default AccessibilityButton;
