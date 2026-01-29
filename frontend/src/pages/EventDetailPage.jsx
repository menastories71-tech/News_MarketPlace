import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import EventRegistrationModal from '../components/user/EventRegistrationModal';
import ApplicationModal from '../components/user/ApplicationModal';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import { useLanguage } from '../context/LanguageContext';
import { useTranslationObject } from '../hooks/useTranslation';
import { getIdFromSlug } from '../utils/slugify';
import {
    MapPin, Calendar, Tag, DollarSign, Globe, Users, Award, Music,
    Camera, Landmark, Info, ArrowLeft, Share, Heart, ExternalLink,
    CheckCircle, Clock, Zap, Shield, Target
} from 'lucide-react';
import SEO from '../components/common/SEO';
import Schema from '../components/common/Schema';
// Removed ShareButtons import to implement manually

const theme = {
    primary: '#1976D2',
    primaryDark: '#0D47A1',
    primaryLight: '#E3F2FD',
    secondary: '#00796B',
    secondaryDark: '#004D40',
    secondaryLight: '#E0F2F1',
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#F44336',
    info: '#9C27B0',
    textPrimary: '#212121',
    textSecondary: '#757575',
    textDisabled: '#BDBDBD',
    background: '#FFFFFF',
    backgroundAlt: '#FAFAFA',
    backgroundSoft: '#F5F5F5',
    borderLight: '#E0E0E0',
    borderMedium: '#BDBDBD',
    borderDark: '#757575'
};

const EventDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { t, language } = useLanguage();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAuth, setShowAuth] = useState(false);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [applicationRoleType, setApplicationRoleType] = useState(null);
    const [isSaved, setIsSaved] = useState(false);

    // Translate event details
    const { translatedObject: translatedEvent } = useTranslationObject(
        event,
        ['title', 'description', 'city', 'country', 'event_type'],
        true
    );

    useEffect(() => {
        if (id) {
            fetchEventDetails();
        }
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            setLoading(true);
            const realId = getIdFromSlug(id);
            const response = await api.get(`/events/${realId}`);
            setEvent(response.data.event || response.data);
        } catch (error) {
            console.error('Error fetching event details:', error);
            if (error.response?.status === 404) {
                navigate('/events');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'TBA';
        return new Date(dateString).toLocaleDateString(language === 'zh-CN' ? 'zh' : language, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getEventTypeIcon = (eventType) => {
        switch (eventType) {
            case 'Government Summit': return <Landmark size={24} />;
            case 'Power List': return <Award size={24} />;
            case 'Membership': return <Users size={24} />;
            case 'Leisure Events': return <Globe size={24} />;
            case 'Sports Events': return <Globe size={24} />;
            case 'Music Festival': return <Music size={24} />;
            case 'Art Festival': return <Camera size={24} />;
            default: return <Tag size={24} />;
        }
    };

    const handleRegisterInterest = () => {
        if (!isAuthenticated) {
            setShowAuth(true);
            return;
        }
        setShowRegistrationModal(true);
    };

    const handleApplyRole = (roleType) => {
        if (!isAuthenticated) {
            setShowAuth(true);
            return;
        }
        setApplicationRoleType(roleType);
        setShowApplicationModal(true);
    };

    const handleSave = () => {
        if (!isAuthenticated) {
            setShowAuth(true);
            return;
        }
        setIsSaved(!isSaved);
    };

    // Local Share State
    const [activeShareId, setActiveShareId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', onResize);
        onResize();
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const handleCopy = (url, id) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const sharePlatforms = [
        { name: 'Telegram', icon: 'telegram', color: '#0088cc', link: (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
        { name: 'WhatsApp', icon: 'whatsapp', color: '#25D366', link: (u, t) => `https://api.whatsapp.com/send?text=${encodeURIComponent(t + '\n' + u)}` },
        { name: 'Facebook', icon: 'facebook', color: '#1877F2', link: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
        { name: 'X', icon: 'x-logo', color: '#000000', link: (u, t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
        { name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2', link: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` }
    ];

    const renderShareMenu = (url, title, id, align = 'center') => {
        const isOpen = activeShareId === id;
        if (!isOpen) return null;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`absolute bottom-full mb-3 z-[1000] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-200 p-3 
          ${align === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'}`}
                style={{ width: isMobile ? '220px' : '280px' }}
            >
                <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center justify-center gap-2">
                    {sharePlatforms.map((p) => (
                        <a
                            key={p.name}
                            href={p.link(url, title)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 shadow-sm"
                            style={{ backgroundColor: p.color }}
                        >
                            <Icon name={p.icon} size={18} />
                        </a>
                    ))}
                    <button
                        onClick={() => handleCopy(url, id)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${copiedId === id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        <Icon name={copiedId === id ? 'check-circle' : 'link'} size={18} />
                    </button>
                </div>
            </motion.div>
        );
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <UserHeader />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
                    <div className="h-4 w-48 bg-slate-200 rounded mb-8" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-[2.5rem] border p-10 space-y-8">
                                <div className="flex items-start gap-6">
                                    <div className="w-20 h-20 bg-slate-100 rounded-2xl" />
                                    <div className="flex-1 space-y-4">
                                        <div className="h-10 w-3/4 bg-slate-200 rounded-lg" />
                                        <div className="flex gap-4">
                                            <div className="h-4 w-24 bg-slate-100 rounded" />
                                            <div className="h-4 w-24 bg-slate-100 rounded" />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-24 bg-slate-50 rounded-2xl" />
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    <div className="h-8 w-48 bg-slate-200 rounded" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-full bg-slate-50 rounded" />
                                        <div className="h-4 w-full bg-slate-50 rounded" />
                                        <div className="h-4 w-2/3 bg-slate-50 rounded" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-[2.5rem] border p-8 space-y-6">
                                <div className="h-12 w-full bg-slate-200 rounded-2xl" />
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-10 w-full bg-slate-50 rounded-xl" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <UserFooter />
            </div>
        );
    }

    const currentEvent = translatedEvent || event;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <SEO
                title={`${currentEvent.title} - News Marketplace`}
                description={currentEvent.description || `Join us for ${currentEvent.title} in ${currentEvent.city}.`}
                type="event"
            />
            <Schema
                type="event"
                data={{
                    name: currentEvent.title,
                    startDate: currentEvent.start_date,
                    endDate: currentEvent.end_date,
                    description: currentEvent.description,
                    locationName: currentEvent.venue_name || "Online",
                    location: `${currentEvent.city}, ${currentEvent.country}`,
                    image: currentEvent.image
                }}
            />
            <UserHeader onShowAuth={() => setShowAuth(true)} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm mb-8">
                    <button
                        onClick={() => navigate('/events')}
                        className="flex items-center space-x-1 text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        <span>{t('events.breadcrumb.back', 'All Events')}</span>
                    </button>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-900 font-medium truncate max-w-xs md:max-w-none">
                        {currentEvent.title}
                    </span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden"
                        >
                            {/* Event Hero */}
                            <div className="h-48 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="p-6 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-2xl">
                                        <div className="text-white">
                                            {getEventTypeIcon(currentEvent.event_type)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 pt-12 relative">
                                <div className="flex flex-wrap items-center gap-3 mb-6">
                                    <span className="px-4 py-2 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-blue-100">
                                        {currentEvent.event_type}
                                    </span>
                                    <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-2xl border ${currentEvent.is_free ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                        {currentEvent.is_free ? t('events.results.free', 'Free Pass') : t('events.results.premium', 'Exclusive')}
                                    </span>
                                </div>

                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight font-primary">
                                    {currentEvent.title}
                                </h1>

                                {/* Event Highlights Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 transition-all hover:bg-blue-50/50 hover:border-blue-100">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="p-2 bg-blue-500 rounded-xl text-white">
                                                <MapPin size={20} />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('events.details.location', 'Location')}</p>
                                        </div>
                                        <p className="text-slate-900 font-bold font-primary">{currentEvent.city || 'TBA'}, {currentEvent.country}</p>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 transition-all hover:bg-purple-50/50 hover:border-purple-100">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="p-2 bg-purple-500 rounded-xl text-white">
                                                <Calendar size={20} />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('events.details.date', 'Event Date')}</p>
                                        </div>
                                        <p className="text-slate-900 font-bold font-primary">{formatDate(currentEvent.start_date)}</p>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 transition-all hover:bg-emerald-50/50 hover:border-emerald-100">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="p-2 bg-emerald-500 rounded-xl text-white">
                                                <Users size={20} />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('events.details.attendees', 'Capacity')}</p>
                                        </div>
                                        <p className="text-slate-900 font-bold font-primary">500+ Curated Guests</p>
                                    </div>
                                </div>

                                {/* About Section */}
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 font-primary">
                                        <Info className="text-blue-600" />
                                        {t('events.details.aboutTitle', 'About This Event')}
                                    </h2>
                                    <div className="prose max-w-none text-slate-600 leading-relaxed font-secondary">
                                        {currentEvent.description ? (
                                            <div className="whitespace-pre-wrap">{currentEvent.description}</div>
                                        ) : (
                                            <p>Join us for an exclusive gathering featuring industry leaders, networking opportunities, and insightful sessions designed for premium professionals.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Social Actions */}
                                <div className="flex items-center gap-4 mt-12 pt-10 border-t border-slate-100">
                                    <button
                                        onClick={handleSave}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all font-primary text-xs font-black uppercase tracking-widest ${isSaved ? 'bg-rose-50 border-rose-200 text-rose-600 scale-[1.02]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} className={isSaved ? 'animate-pulse' : ''} />
                                        {isSaved ? t('events.details.saved', 'Saved') : t('events.details.save', 'Save Event')}
                                    </button>
                                    <div className="relative">
                                        <button
                                            onClick={() => setActiveShareId(activeShareId === 'event' ? null : 'event')}
                                            className="flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all font-primary text-xs font-black uppercase tracking-widest bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                        >
                                            <Icon name="share" size={16} />
                                            {t('common.share', 'Share')}
                                        </button>
                                        {renderShareMenu(window.location.href, currentEvent.title, 'event')}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[3rem] border border-slate-200 shadow-lg shadow-slate-200/50 p-8 sticky top-28"
                        >
                            <h3 className="text-xl font-black text-slate-900 mb-8 font-primary flex items-center gap-3">
                                <Zap className="text-blue-600" />
                                {t('events.details.participation', 'Event Participation')}
                            </h3>

                            <div className="space-y-4">
                                {currentEvent.custom_form_fields && (
                                    <button
                                        onClick={handleRegisterInterest}
                                        className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        {t('events.results.registerInterest', 'Register Interest')}
                                        <ArrowLeft className="rotate-180" size={16} />
                                    </button>
                                )}

                                <div className="grid grid-cols-1 gap-3 pt-4">
                                    {currentEvent.enable_sponsor && (
                                        <button
                                            onClick={() => handleApplyRole('sponsor')}
                                            className="w-full py-4 px-6 bg-slate-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-slate-100 hover:bg-white hover:border-blue-400 hover:text-blue-600 hover:shadow-lg transition-all flex items-center justify-between group"
                                        >
                                            <span>{t('events.results.sponsor', 'Sponsor Pack')}</span>
                                            <Target size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                    {currentEvent.enable_media_partner && (
                                        <button
                                            onClick={() => handleApplyRole('media_partner')}
                                            className="w-full py-4 px-6 bg-slate-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-slate-100 hover:bg-white hover:border-blue-400 hover:text-blue-600 hover:shadow-lg transition-all flex items-center justify-between group"
                                        >
                                            <span>{t('events.results.media', 'Media Partner')}</span>
                                            <Shield size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                    {currentEvent.enable_speaker && (
                                        <button
                                            onClick={() => handleApplyRole('speaker')}
                                            className="w-full py-4 px-6 bg-slate-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-slate-100 hover:bg-white hover:border-blue-400 hover:text-blue-600 hover:shadow-lg transition-all flex items-center justify-between group"
                                        >
                                            <span>{t('events.results.speaker', 'Speaker Slot')}</span>
                                            <Award size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                    {currentEvent.enable_guest && (
                                        <button
                                            onClick={() => handleApplyRole('guest')}
                                            className="w-full py-4 px-6 bg-slate-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-slate-100 hover:bg-white hover:border-blue-400 hover:text-blue-600 hover:shadow-lg transition-all flex items-center justify-between group"
                                        >
                                            <span>{t('events.results.guest', 'Guest Ticket')}</span>
                                            <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-10 p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100/50">
                                <div className="flex items-center gap-3 mb-3">
                                    <Info size={16} className="text-blue-600" />
                                    <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">{t('events.details.notice', 'Premium Notice')}</p>
                                </div>
                                <p className="text-[11px] text-blue-800 leading-relaxed font-secondary">
                                    This is a curated event for industry elites. Participation is subject to verification by our board.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            <UserFooter />

            <AnimatePresence>
                {showRegistrationModal && (
                    <EventRegistrationModal
                        isOpen={showRegistrationModal}
                        onClose={() => setShowRegistrationModal(false)}
                        event={event}
                    />
                )}
                {showApplicationModal && (
                    <ApplicationModal
                        isOpen={showApplicationModal}
                        onClose={() => setShowApplicationModal(false)}
                        event={event}
                        roleType={applicationRoleType}
                    />
                )}
                {showAuth && (
                    <AuthModal
                        isOpen={showAuth}
                        onClose={() => setShowAuth(false)}
                        onLoginSuccess={() => setShowAuth(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default EventDetailPage;
