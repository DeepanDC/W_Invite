
import React, { useState, useEffect, useCallback } from 'react';

// --- RSVP Backend ---
const RSVP_BACKEND_URL = 'https://api.npoint.io/3a876920ab8241b65645';

// --- Type Definitions ---
interface TimeLeft { days: number; hours: number; minutes: number; seconds: number; }
interface RsvpEntry { name: string; status: 'yes' | 'no'; message: string; }

// --- Themed SVG Icon Components ---
const HeartIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg> );

// --- Animated Background Components ---
const AnimatedFloralBackground: React.FC<{ direction: 'up' | 'down' }> = ({ direction }) => (
    <div className="petals-container">
        {Array.from({ length: 10 }).map((_, i) => (
            <HeartIcon key={i} className={`petal ${direction === 'up' ? 'petal-bottom' : 'petal-top'}`} />
        ))}
    </div>
);

const MapPinIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg> );
const OrnateDivider: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => ( <div className={`py-6 text-center text-primary ${className || ''}`} style={style}><svg width="150" height="30" viewBox="0 0 150 30" className="inline-block" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 15H50" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.5"/><path d="M100 15H150" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.5"/><path d="M75 21C78.3137 21 81 18.3137 81 15C81 11.6863 78.3137 9 75 9C71.6863 9 69 11.6863 69 15C69 18.3137 71.6863 21 75 21Z" stroke="currentColor" strokeOpacity="0.8" strokeWidth="1.5"/><path d="M65.5 15C65.5 19.1421 69.8579 22.5 75 22.5C80.1421 22.5 84.5 19.1421 84.5 15C84.5 10.8579 80.1421 7.5 75 7.5C69.8579 7.5 65.5 10.8579 65.5 15Z" stroke="#FFBF00" strokeOpacity="0.7" strokeWidth="1"/><path d="M75 5V0M75 30V25M90 15H95M55 15H60" stroke="#FFBF00" strokeOpacity="0.6" strokeWidth="1" strokeLinecap="round"/></svg></div> );
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> );
const SunIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> );
const MoonIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> );
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>);
const RingsIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6.75 6.75 0 006.75-6.75H5.25A6.75 6.75 0 0012 18.75z" /></svg>);
const CameraIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>);
const FoodIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 12.75V5.25a2.25 2.25 0 00-2.25-2.25h-15a2.25 2.25 0 00-2.25 2.25v7.5m19.5 0A2.25 2.25 0 0119.5 15h-15a2.25 2.25 0 01-2.25-2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.625a2.25 2.25 0 01-2.36 0l-7.5-4.625A2.25 2.25 0 012.25 12.993V12.75m19.5 0h-19.5" /></svg>);
const BusIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036l2.828-2.828m-2.828 2.828l-2.828 2.828m-2.828-2.828l-2.828-2.828m2.828 2.828l-3.536 3.536m-1.414-1.414L6.343 8.343m6.364-6.364l-1.414 1.414" /></svg>);

const TimeBox: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center justify-center w-16 sm:w-20">
        <span className="text-2xl sm:text-3xl font-bold text-secondary">{value.toString().padStart(2, '0')}</span>
        <span className="text-xs sm:text-sm uppercase tracking-wider text-primary">{label}</span>
    </div>
);

function App() {
    const googleMapsUrl = 'https://maps.app.goo.gl/upR92xf4KrvbUWUn8';
    const sharedAlbumUrl = 'https://drive.google.com/drive/folders/1a1LvcI5VScaN73-m7ii_X7u7Nmr2kS5U';
    
    // RSVP State
    const [name, setName] = useState('');
    const [rsvpStatus, setRsvpStatus] = useState<'yes' | 'no' | null>(null);
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [rsvpList, setRsvpList] = useState<RsvpEntry[]>([]);
    const [isLoadingRsvps, setIsLoadingRsvps] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'attending' | 'regrets'>('attending');
    
    // Theme State
    const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('wedding-theme') as 'light' | 'dark') || 'dark');

    // Theme Effect
    useEffect(() => {
        localStorage.setItem('wedding-theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    // Countdown Timer
    const calculateTimeLeft = useCallback((): TimeLeft | null => {
        const weddingDate = new Date('2025-11-30T06:00:00').getTime();
        const difference = weddingDate - new Date().getTime();
        if (difference > 0) return { days: Math.floor(difference / 86400000), hours: Math.floor(difference / 3600000) % 24, minutes: Math.floor(difference / 60000) % 60, seconds: Math.floor(difference / 1000) % 60 };
        return null;
    }, []);
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    useEffect(() => {
        const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearTimeout(timer);
    });
    
    // Data Fetching
    const fetchRsvps = useCallback(async () => {
        setIsLoadingRsvps(true);
        try {
            const response = await fetch(RSVP_BACKEND_URL);
            if (!response.ok) throw new Error('Failed to fetch RSVP list.');
            const data = await response.json();
            setRsvpList(Array.isArray(data) ? data : []);
        } catch (error) { setFetchError('Could not load guest responses.'); } 
        finally { setIsLoadingRsvps(false); }
    }, []);

    useEffect(() => { fetchRsvps(); }, [fetchRsvps]);

    // Handlers
    const handleRsvpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !rsvpStatus) return alert('Please enter your name and select your RSVP choice.');
        const newRsvp: RsvpEntry = { name: name.trim(), status: rsvpStatus, message };
        try {
            const updatedRsvps = [...rsvpList, newRsvp];
            const response = await fetch(RSVP_BACKEND_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedRsvps) });
            if (!response.ok) throw new Error('Failed to submit RSVP.');
            setRsvpList(updatedRsvps);
            setIsSubmitted(true);
        } catch (error) { alert("Sorry, we couldn't save your response. Please try again."); }
    };
    
    const attending = rsvpList.filter(r => r.status === 'yes');
    const regrets = rsvpList.filter(r => r.status === 'no');
    
    const scheduleItems = [
        { icon: <RingsIcon />, time: "6:00 AM - 7:30 AM", title: "Muhurtham Ceremony", description: "The sacred wedding ceremony where we tie the knot." },
        { icon: <CameraIcon />, time: "9:00 AM - 1:00 PM", title: "Reception & Photo Session", description: "Join us for the reception and a photo session to capture our memories together." },
        { icon: <FoodIcon />, time: "Starts from 7:30 AM", title: "Wedding Breakfast | Brunch", description: "Enjoy a delicious traditional breakfast with us." }
    ];

    const busRoutes = [
        { number: "150", route: "Broadway to Avadi" },
        { number: "565", route: "Sriperumbudur to Avadi Checkpost" },
        { number: "62", route: "Poonamallee to Red Hills" },
        { number: "41D", route: "Mandaveli to Avadi" },
        { number: "73", route: "M.G.R. Koyambedu (C.M.B.T.) to Avadi" },
        { number: "202", route: "Avadi to Tambaram" },
        { number: "505", route: "Redhills to Thiruvallur" },
        { number: "572", route: "Avadi Bus Depot to Thiruvallur Bus Station" },
        { number: "65B", route: "Avadi to Poonamallee" },
        { number: "65G", route: "Avadi to Meyyur" },
        { number: "65H", route: "Avadi to Red Hills" },
        { number: "71V", route: "Broadway to Veppampattu Eswaran Nagar" },
        { number: "77V", route: "M.G.R. Koyambedu to Veppampattu" },
        { number: "580M", route: "Avadi Bus Depot to Thirunindravoor" },
        { number: "S47", route: "Avadi Bus Depot to Mittanamallee" },
        { number: "S48", route: "Avadi Bus Depot to Siranjeevi Nagar" },
        { number: "580S", route: "Avadi to Siruvapuri Temple" },
        { number: "62T", route: "Variant of the 62 route" },
    ];


    return (
        <div className="min-h-screen w-full bg-no-repeat bg-cover bg-center bg-fixed relative" style={{ backgroundImage: `url('Picsart_25-10-06_05-26-07-931.png')` }}>
            <div className={`absolute inset-0 bg-gradient-to-b from-transparent ${theme === 'light' ? 'via-white/20 to-white/50' : 'via-black/10 to-black/40'}`}></div>
            <AnimatedFloralBackground direction="up" />
            <AnimatedFloralBackground direction="down" />

            <button onClick={toggleTheme} className="theme-toggle-btn text-primary" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            
            <main className="min-h-screen w-full flex flex-col items-center justify-start p-4 sm:p-8 overflow-y-auto relative z-10">
                <div className="w-full max-w-lg text-center space-y-4 pt-20 sm:pt-24 pb-16">
                    {/* --- INVITATION CARD --- */}
                    <div className="glass-card p-6 sm:p-8">
                        <h2 className="font-cinzel-decorative text-2xl sm:text-3xl tracking-wider text-shadow-gold text-primary animate-fade-in delay-200">You're Invited to the Wedding of</h2>
                        <OrnateDivider className="animate-fade-in delay-400" />
                        <h1 className="font-alex-brush text-5xl sm:text-6xl my-2 animate-fade-in-scale delay-600 text-shadow-gold text-primary">Deepan Chakravarthy M<br/><span className="font-cinzel-decorative text-2xl sm:text-3xl">&</span><br/>Deepa S</h1>
                        <p className="text-base sm:text-lg leading-relaxed pt-4 animate-fade-in delay-800 text-secondary">Join us as we begin our new life together.</p>
                        <div className="animate-fade-in delay-1000">
                            <OrnateDivider />
                            <div className="space-y-2 text-base sm:text-lg font-semibold text-secondary">
                                <p>Sunday, 30th November 2025</p>
                            </div>
                            <div className="py-8">
                                {timeLeft ? (<div className="flex justify-center gap-2 sm:gap-4"><TimeBox value={timeLeft.days} label="Days" /><TimeBox value={timeLeft.hours} label="Hours" /><TimeBox value={timeLeft.minutes} label="Minutes" /><TimeBox value={timeLeft.seconds} label="Seconds" /></div>) 
                                : (<p className="text-xl font-semibold text-primary">The big day is here!</p>)}
                            </div>
                            <div className="space-y-1 text-secondary">
                                <p className="text-lg sm:text-xl font-bold tracking-wide">V.K.K. Menon Convention Centre</p>
                                <p className="text-sm sm:text-base">Giri Nagar, O.C.F. Estate, Avadi, Chennai - 600054</p>
                            </div>
                            <div className="pt-8"><a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center btn-primary"><MapPinIcon /> View Location</a></div>
                        </div>
                    </div>
                    
                    {/* --- SCHEDULE OF EVENTS --- */}
                    <div className="pt-8 animate-fade-in delay-1200">
                        <div className="glass-card p-6 sm:p-8 space-y-6">
                            <h2 className="font-cinzel-decorative text-2xl sm:text-3xl tracking-wider text-primary">Schedule of Events</h2>
                            <div className="space-y-6 text-left">
                                {scheduleItems.map((item, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            {item.icon}
                                            {index < scheduleItems.length - 1 && <div className="w-px h-12 bg-primary/30 mt-2"></div>}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-secondary">{item.time}</p>
                                            <h3 className="font-semibold text-xl text-primary">{item.title}</h3>
                                            <p className="text-secondary/90">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- GETTING THERE BY BUS --- */}
                    <div className="pt-8 animate-fade-in delay-1400">
                        <div className="glass-card p-6 sm:p-8 space-y-6">
                            <div className="flex items-center justify-center gap-4">
                                <BusIcon />
                                <h2 className="font-cinzel-decorative text-2xl sm:text-3xl tracking-wider text-primary">Getting There</h2>
                            </div>
                            <p className="text-secondary text-base">
                                For guests traveling by public transport, numerous bus routes stop at or near the Avadi Checkpost. Here are some of the key routes:
                            </p>
                            <div className="text-left space-y-3 max-h-60 overflow-y-auto pr-2">
                                {busRoutes.map((route, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <span className="font-bold text-lg bg-primary/10 text-primary rounded-full w-12 h-12 flex-shrink-0 flex items-center justify-center">{route.number}</span>
                                        <span className="text-secondary font-medium">{route.route}</span>
                                    </div>
                                ))}
                            </div>
                             <p className="text-secondary/80 text-sm pt-2">
                                Please check the latest bus schedules and routes from your location. We recommend using a map app for the final stop details.
                            </p>
                        </div>
                    </div>

                    {/* --- RSVP & GUESTBOOK CARD --- */}
                    <div className="pt-8 animate-fade-in delay-1600">
                        <div className="glass-card p-6 sm:p-8 space-y-8">
                            <h2 className="font-cinzel-decorative text-2xl sm:text-3xl tracking-wider text-primary">Our Guestbook & RSVP</h2>
                            {isSubmitted ? (
                                <div className="text-center space-y-4 py-8"><CheckCircleIcon className="w-20 h-20 text-emerald-500 mx-auto" /><p className="font-semibold text-2xl text-secondary">Thank you for your response!</p><p className="text-lg text-secondary">We can't wait to celebrate with you.</p></div>
                            ) : (
                                <form onSubmit={handleRsvpSubmit} className="space-y-6 max-w-lg mx-auto text-secondary">
                                    <div className="space-y-2"><label htmlFor="name" className="font-semibold text-lg text-primary">1. Please enter your name</label><input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Full Name" required className="form-input text-center"/></div>
                                    <div className="space-y-2"><p className="font-semibold text-lg text-primary">2. Will you be joining us?</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div onClick={() => setRsvpStatus('yes')} aria-pressed={rsvpStatus === 'yes'} className={`rsvp-choice-card ${rsvpStatus === 'yes' ? 'selected' : ''}`}><HeartIcon className="w-8 h-8 mx-auto mb-2 choice-icon" /><span className="font-semibold text-lg">Joyfully Attending</span></div><div onClick={() => setRsvpStatus('no')} aria-pressed={rsvpStatus === 'no'} className={`rsvp-choice-card ${rsvpStatus === 'no' ? 'selected' : ''}`}><svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto mb-2 choice-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg><span className="font-semibold text-lg">Regretfully Decline</span></div></div></div>
                                    <div className="space-y-2"><label htmlFor="message" className="font-semibold text-lg text-primary">3. Leave a message (optional)</label><textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share your blessings..." rows={3} className="form-input" /></div>
                                    <div><button type="submit" className="btn-primary w-full">Send RSVP</button></div>
                                </form>
                            )}
                            <div className="pt-4">{isLoadingRsvps ? <p className="text-secondary">Loading responses...</p> : fetchError ? <p className="text-red-500">{fetchError}</p> : (<div><div className="guest-list-tabs"><div onClick={() => setActiveTab('attending')} className={`guest-list-tab ${activeTab === 'attending' ? 'active' : ''}`}>Attending ({attending.length})</div><div onClick={() => setActiveTab('regrets')} className={`guest-list-tab ${activeTab === 'regrets' ? 'active' : ''}`}>Sending Wishes ({regrets.length})</div></div><div className="pt-4 text-center">{activeTab === 'attending' && (<div className="flex flex-wrap justify-center">{attending.length > 0 ? attending.map((r, i) => <span key={i} className="guest-chip">{r.name}</span>) : <p className="text-secondary">Be the first to RSVP!</p>}</div>)}{activeTab === 'regrets' && (<div className="flex flex-wrap justify-center">{regrets.length > 0 ? regrets.map((r, i) => <span key={i} className="guest-chip">{r.name}</span>) : <p className="text-secondary">No regrets yet!</p>}</div>)}</div></div>)}</div>
                         </div>
                     </div>

                    {/* --- SHARE YOUR MEMORIES CARD --- */}
                     <div className="pt-8 animate-fade-in delay-1800">
                        <div className="glass-card p-6 sm:p-8 space-y-6">
                            <h2 className="font-cinzel-decorative text-2xl sm:text-3xl tracking-wider text-primary">Share Your Memories</h2>
                            <p className="text-secondary text-lg">
                                Help us capture the joy! Click below to upload your favorite photos and videos to our shared Google Drive folder.
                            </p>
                            <div className="pt-4">
                                <a 
                                    href={sharedAlbumUrl}
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center justify-center btn-primary"
                                >
                                    <UploadIcon className="w-5 h-5 mr-2" />
                                    Upload to Shared Drive
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* --- WITH LOVE --- */}
                    <div className="pt-8 animate-fade-in" style={{ animationDelay: '2000ms' }}>
                        <div className="glass-card p-6 sm:p-8 space-y-4 text-center">
                            <h2 className="font-cinzel-decorative text-2xl sm:text-3xl tracking-wider text-primary">With Love</h2>
                            <OrnateDivider />
                            <p className="text-secondary text-lg italic">
                                Your presence at our wedding is the greatest gift of all. We can't wait to celebrate this special day with you!
                            </p>
                            <p className="font-alex-brush text-4xl pt-4 text-primary text-shadow-gold">
                                Deepan & Deepa
                            </p>
                        </div>
                    </div>

                     <div className="h-40"></div>
                </div>
            </main>
        </div>
    );
}

export default App;
