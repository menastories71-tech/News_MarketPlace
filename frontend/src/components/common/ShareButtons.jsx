import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';

const ShareButtons = ({ url, title, description, image, variant = 'default', showLabel = true, className = "", fullWidth = false, direction = 'up', onToggle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleOpen = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        if (onToggle) onToggle(nextState);
    };

    const shareLinks = [
        {
            name: 'Telegram',
            icon: <Icon name="telegram" size={isMobile ? "sm" : "md"} />,
            color: '#0088cc',
            link: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        },
        {
            name: 'WhatsApp',
            icon: <Icon name="whatsapp" size={isMobile ? "sm" : "md"} />,
            color: '#25D366',
            link: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + (image ? '\n' + image : '') + '\n\n' + url)}`
        },
        {
            name: 'Facebook',
            icon: <Icon name="facebook" size={isMobile ? "sm" : "md"} />,
            color: '#1877F2',
            link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        },
        {
            name: 'Email',
            icon: <Icon name="mail" size={isMobile ? "sm" : "md"} />,
            color: '#EA4335',
            link: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\n' + url + (image ? '\n\nSource: ' + image : ''))}`
        },
        {
            name: 'X',
            icon: <Icon name="x-logo" size={isMobile ? "sm" : "md"} />,
            color: '#000000',
            link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        },
        {
            name: 'LinkedIn',
            icon: <Icon name="linkedin" size={isMobile ? "sm" : "md"} />,
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
                onClick={toggleOpen}
                className={getTriggerStyles()}
                title="Share this page"
            >
                <Icon name="share" size={variant === 'default' ? (isMobile ? 'sm' : 'md') : 'sm'} />
                {showLabel && variant !== 'default' && <span className="font-medium">Share</span>}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: direction === 'up' ? 10 : -10 }}
                        animate={{ opacity: 1, scale: 1, y: direction === 'up' ? -10 : 10 }}
                        exit={{ opacity: 0, scale: 0.8, y: direction === 'up' ? 10 : -10 }}
                        className={`absolute ${direction === 'up' ? 'bottom-full mb-4' : 'top-full mt-2'} bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 sm:p-4 z-[9999] right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2`}
                        style={{
                            width: 'max-content',
                            maxWidth: 'min(calc(100vw - 40px), 320px)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
                        }}
                    >
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                            {shareLinks.map((plat) => (
                                <a
                                    key={plat.name}
                                    href={plat.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-90 shadow-sm hover:shadow-md"
                                    style={{ backgroundColor: plat.color }}
                                    title={`Share on ${plat.name}`}
                                >
                                    {plat.icon}
                                </a>
                            ))}
                            <button
                                onClick={copyToClipboard}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm hover:shadow-md ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                title="Copy link"
                            >
                                {copied ? <Icon name="check-circle" size={isMobile ? "sm" : "md"} /> : <Icon name="link" size={isMobile ? "sm" : "md"} />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShareButtons;
