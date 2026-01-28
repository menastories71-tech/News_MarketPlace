import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, // Telegram
    MessageCircle, // WhatsApp (MessageCircle or similar)
    Facebook,
    Mail,
    Link2,
    Share2,
    Linkedin
} from 'lucide-react';

// For X (Twitter) icon, we'll use a custom SVG since lucide might not have the new X logo yet
const XIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.494h2.039L6.486 3.24H4.298l13.311 17.407z" />
    </svg>
);

const WhatsAppIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
);

const TelegramIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.697.064-1.225-.461-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.329-.912.49-1.299.481-.426-.008-1.246-.24-1.856-.437-.748-.242-1.344-.37-1.292-.781.027-.214.324-.433.89-.658 3.488-1.518 5.812-2.52 6.974-3.004 3.314-1.38 4.002-1.62 4.451-1.628z" />
    </svg>
);

const ShareButtons = ({ url, title, description, image, variant = 'default', showLabel = true, className = "", fullWidth = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareLinks = [
        {
            name: 'Telegram',
            icon: <TelegramIcon size={20} />,
            color: '#0088cc',
            link: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        },
        {
            name: 'WhatsApp',
            icon: <WhatsAppIcon size={22} />,
            color: '#25D366',
            link: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + (image ? '\n' + image : '') + '\n\n' + url)}`
        },
        {
            name: 'Facebook',
            icon: <Facebook size={20} />,
            color: '#1877F2',
            link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        },
        {
            name: 'Email',
            icon: <Mail size={20} />,
            color: '#EA4335',
            link: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\n' + url + (image ? '\n\nSource: ' + image : ''))}`
        },
        {
            name: 'X',
            icon: <XIcon size={18} />,
            color: '#000000',
            link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        },
        {
            name: 'LinkedIn',
            icon: <Linkedin size={20} />,
            color: '#0A66C2',
            link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        }
    ];

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getTriggerStyles = () => {
        const base = `flex flex-row items-center justify-center gap-2 transition-all duration-300 font-bold whitespace-nowrap ${fullWidth ? 'w-full' : 'w-auto'} ${className}`;
        switch (variant) {
            case 'outline':
                return `${base} px-6 py-3.5 border-2 border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:border-slate-300`;
            case 'ghost':
                return `${base} px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl`;
            default:
                return "w-12 h-12 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:shadow-xl transition-all duration-300 active:scale-95";
        }
    };

    return (
        <div className={`relative ${fullWidth ? 'w-full' : 'inline-block'}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={getTriggerStyles()}
                title="Share this page"
            >
                <Share2 size={variant === 'default' ? 20 : 18} />
                {showLabel && variant !== 'default' && <span className="font-medium">Share</span>}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: -10 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className="absolute bottom-full mb-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-2 sm:p-3 flex flex-row items-center gap-1 sm:gap-2 z-[150] right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 flex-nowrap"
                        style={{ width: 'max-content', maxWidth: 'calc(100vw - 32px)', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}
                    >
                        <div className="flex flex-row items-center gap-1.5 sm:gap-2 px-1">
                            {shareLinks.map((plat) => (
                                <a
                                    key={plat.name}
                                    href={plat.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-90"
                                    style={{ backgroundColor: plat.color }}
                                    title={`Share on ${plat.name}`}
                                >
                                    {plat.icon}
                                </a>
                            ))}
                            <button
                                onClick={copyToClipboard}
                                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                title="Copy link"
                            >
                                {copied ? <CheckCircle size={18} /> : <Link2 size={18} />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const CheckCircle = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

export default ShareButtons;
