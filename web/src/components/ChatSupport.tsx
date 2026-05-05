'use client';

export default function ChatSupport() {
    const whatsappNumber = '+13314812451'; // Replace with actual WhatsApp number
    const whatsappLink = `https://wa.me/${whatsappNumber}`;

    const handleChatClick = () => {
        window.open(whatsappLink, '_blank', 'noopener,noreferrer');
    };

    return (
        <button
            onClick={handleChatClick}
            className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 group flex items-center justify-center"
            aria-label="Chat with support on WhatsApp"
            title="Chat with support"
        >
            {/* Chat icon using Material Symbols */}
            <span className="material-symbols-outlined text-3xl">
                chat
            </span>

            {/* Tooltip */}
            <span className="absolute right-full mr-3 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                Chat with Support
            </span>
        </button>
    );
}
