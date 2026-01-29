import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';

const ShareButtons = ({ url, title, description, image, variant = 'default', showLabel = true, className = "", fullWidth = false, direction = 'up', align = 'center', onToggle }) => {
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
            icon: <Icon name="telegram" size={isMobile ? "xs" : "md"} />,
            color: '#0088cc',
            link: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        },
        {
            name: 'WhatsApp',
            icon: <Icon name="whatsapp" size={isMobile ? "xs" : "md"} />,
            color: '#25D366',
            link: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + (image ? '\n' + image : '') + '\n\n' + url)}`
        },
        {
            name: 'Facebook',
            icon: <Icon name="facebook" size={isMobile ? "xs" : "md"} />,
            color: '#1877F2',
            link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        },
        {
            name: 'Email',
            icon: <Icon name="mail" size={isMobile ? "xs" : "md"} />,
            color: '#EA4335',
            link: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\n' + url + (image ? '\n\nSource: ' + image : ''))}`
        },
        {
            name: 'X',
            icon: <Icon name="x-logo" size={isMobile ? "xs" : "md"} />,
            color: '#000000',
            link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        },
        {
            name: 'LinkedIn',
            icon: <Icon name="linkedin" size={isMobile ? "xs" : "md"} />,
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
                return `${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:shadow-xl transition-all duration-300 active:scale-95`;
        }
    };

    return (
        <div className={`relative ${fullWidth ? 'w-full' : 'inline-block'}`}>
            <button
                onClick={toggleOpen}
                className={getTriggerStyles()}
                title="Share this page"
            >
                <Icon name="share" size={variant === 'default' ? (isMobile ? 'xs' : 'md') : 'sm'} />
                {showLabel && variant !== 'default' && <span className="font-medium">Share</span>}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.9,
                            y: direction === 'up' ? 10 : -10,
                            x: align === 'center' ? '-50%' : '0%'
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: direction === 'up' ? -10 : 10,
                            x: align === 'center' ? '-50%' : '0%'
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.9,
                            y: direction === 'up' ? 10 : -10,
                            x: align === 'center' ? '-50%' : '0%'
                        }}
                        className={`absolute ${direction === 'up' ? 'bottom-full mb-4' : 'top-full mt-2'} bg-white border border-slate-200 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-2 sm:p-3 z-[10000]
                            ${align === 'center' ? 'left-1/2' : align === 'right' ? 'right-0' : 'left-0'}`}
                        style={{
                            width: 'max-content',
                            maxWidth: 'calc(100vw - 32px)',
                            transformOrigin: direction === 'up'
                                ? (align === 'center' ? 'bottom center' : align === 'right' ? 'bottom right' : 'bottom left')
                                : (align === 'center' ? 'top center' : align === 'right' ? 'top right' : 'top left')
                        }}
                    >
                        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3">
                            {shareLinks.map((plat) => (
                                <a
                                    key={plat.name}
                                    href={plat.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${isMobile ? 'w-9 h-9' : 'w-10 h-10'} rounded-xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-90 shadow-sm hover:shadow-md`}
                                    style={{ backgroundColor: plat.color }}
                                    title={`Share on ${plat.name}`}
                                >
                                    {plat.icon}
                                </a>
                            ))}
                            <button
                                onClick={copyToClipboard}
                                className={`${isMobile ? 'w-9 h-9' : 'w-10 h-10'} rounded-xl flex items-center justify-center transition-all shadow-sm hover:shadow-md ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                title="Copy link"
                            >
                                {copied ? <Icon name="check-circle" size={isMobile ? "xs" : "md"} /> : <Icon name="link" size={isMobile ? "xs" : "md"} />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShareButtons;
