import React, { useState, useEffect, useCallback } from 'react';

// --- ACTION REQUIRED ---
// To make the RSVP list work, you need a simple backend.
// 1. Go to https://www.npoint.io/
// 2. Paste `[]` into the editor and click "Create".
// 3. Copy the URL it gives you and paste it below, replacing the placeholder.
const RSVP_BACKEND_URL = 'https://api.npoint.io/1c86395648bd42a67003';

// --- Animated Background Components ---
const AnimatedFloralBackground: React.FC<{ direction: 'up' | 'down' }> = ({ direction }) => (
    <div className="petals-container">
        {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={`petal ${direction === 'up' ? 'petal-bottom' : 'petal-top'}`}></div>
        ))}
    </div>
);

// --- Themed SVG Icon Components ---
const MapPinIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const OrnateDivider: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`py-6 text-center ${className || ''}`}>
        <svg width="150" height="30" viewBox="0 0 150 30" className="inline-block" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 15H50" stroke="#A62639" strokeOpacity="0.6" strokeWidth="1.5"/>
            <path d="M100 15H150" stroke="#A62639" strokeOpacity="0.6" strokeWidth="1.5"/>
            <path d="M75 21C78.3137 21 81 18.3137 81 15C81 11.6863 78.3137 9 75 9C71.6863 9 69 11.6863 69 15C69 18.3137 71.6863 21 75 21Z" stroke="#A62639" strokeOpacity="0.8" strokeWidth="1.5"/>
            <path d="M65.5 15C65.5 19.1421 69.8579 22.5 75 22.5C80.1421 22.5 84.5 19.1421 84.5 15C84.5 10.8579 80.1421 7.5 75 7.5C69.8579 7.5 65.5 10.8579 65.5 15Z" stroke="#FFBF00" strokeOpacity="0.7" strokeWidth="1"/>
            <path d="M75 5V0M75 30V25M90 15H95M55 15H60" stroke="#FFBF00" strokeOpacity="0.6" strokeWidth="1" strokeLinecap="round"/>
        </svg>
    </div>
);


const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
);


const TimeBox: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center justify-center w-16 sm:w-20">
        <span className="text-2xl sm:text-3xl font-bold" style={{color: '#4D2424'}}>{value.toString().padStart(2, '0')}</span>
        <span className="text-xs sm:text-sm uppercase tracking-wider" style={{color: '#A62639'}}>{label}</span>
    </div>
);

interface TimeLeft { days: number; hours: number; minutes: number; seconds: number; }
interface RsvpEntry { name: string; status: 'yes' | 'no'; message: string; }

function App() {
    const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=Thiruverkadu+Temple,+Chennai';
    
    const [name, setName] = useState('');
    const [rsvpStatus, setRsvpStatus] = useState<'yes' | 'no' | null>(null);
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [rsvpList, setRsvpList] = useState<RsvpEntry[]>([]);
    const [isLoadingRsvps, setIsLoadingRsvps] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'attending' | 'regrets'>('attending');


    const calculateTimeLeft = (): TimeLeft | null => {
        const weddingDate = new Date('2025-12-07T06:30:00').getTime();
        const now = new Date().getTime();
        const difference = weddingDate - now;

        if (difference > 0) {
            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return null;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearTimeout(timer);
    });
    
    const fetchRsvps = useCallback(async () => {
        if (RSVP_BACKEND_URL.includes('YOUR_UNIQUE_ID')) {
            setFetchError("Please set your backend URL in App.tsx to see the RSVP list.");
            setIsLoadingRsvps(false);
            return;
        }
        try {
            const response = await fetch(RSVP_BACKEND_URL);
            if (!response.ok) throw new Error('Failed to fetch RSVP list.');
            const data = await response.json();
            setRsvpList(Array.isArray(data) ? data : []);
        } catch (error) {
            setFetchError('Could not load guest responses.');
        } finally {
            setIsLoadingRsvps(false);
        }
    }, []);

    useEffect(() => {
        fetchRsvps();
    }, [fetchRsvps]);

    const handleRsvpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !rsvpStatus) {
            alert('Please enter your name and select your RSVP choice.');
            return;
        }
        
        const newRsvp: RsvpEntry = { name: name.trim(), status: rsvpStatus, message };

        try {
            const currentRsvpsResponse = await fetch(RSVP_BACKEND_URL);
            if (!currentRsvpsResponse.ok) throw new Error('Failed to get current RSVP list.');
            const currentRsvps = await currentRsvpsResponse.json();
            
            const updatedRsvps = [...(Array.isArray(currentRsvps) ? currentRsvps : []), newRsvp];
            
            const response = await fetch(RSVP_BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedRsvps),
            });

            if (!response.ok) throw new Error('Failed to submit RSVP.');

            setRsvpList(updatedRsvps);
            setIsSubmitted(true);
        } catch (error) {
            alert("Sorry, we couldn't save your response. Please try again.");
        }
    };
    
    const attending = rsvpList.filter(r => r.status === 'yes');
    const regrets = rsvpList.filter(r => r.status === 'no');

    return (
        <div 
            className="min-h-screen w-full bg-no-repeat bg-cover bg-center bg-fixed relative"
            style={{ backgroundImage: `url('Picsart_25-10-06_05-26-07-931.png')` }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#A62639]/20"></div>
            <AnimatedFloralBackground direction="up" />
            <AnimatedFloralBackground direction="down" />
            
            <main className="min-h-screen w-full flex flex-col items-center justify-start p-4 sm:p-8 overflow-y-auto relative z-10">
                <div className="w-full max-w-lg text-center space-y-4 pt-20 sm:pt-24 pb-16" style={{color: '#4D2424'}}>
                    <div className="glass-card p-6 sm:p-8">
                        <h2 className="font-cinzel-decorative text-2xl sm:text-3xl tracking-wider text-shadow-gold animate-fade-in delay-200" style={{color: '#A62639'}}>
                            You're Invited to the Wedding of
                        </h2>
                        
                        <OrnateDivider className="animate-fade-in delay-400" />
                        
                        <h1 className="font-alex-brush text-5xl sm:text-6xl my-2 animate-fade-in-scale delay-600 text-shadow-gold" style={{color: '#A62639'}}>
                            Deepan Chakravarthy<br/>
                            <span className="font-cinzel-decorative text-2xl sm:text-3xl">&</span><br/>
                            Deepa
                        </h1>

                        <p className="text-base sm:text-lg leading-relaxed pt-4 animate-fade-in delay-800">
                            Join us as we begin our new life together.
                        </p>
                        
                        <div className="animate-fade-in delay-1000">
                            <OrnateDivider />
                            <div className="space-y-2 text-base sm:text-lg font-semibold">
                                <p>Sunday, 7th December 2025</p>
                                <p>Ceremony between 6:30 am to 7:30 am</p>
                            </div>
                            <div className="py-8">
                                {timeLeft ? (
                                    <div className="flex justify-center gap-2 sm:gap-4">
                                        <TimeBox value={timeLeft.days} label="Days" />
                                        <TimeBox value={timeLeft.hours} label="Hours" />
                                        <TimeBox value={timeLeft.minutes} label="Minutes" />
                                        <TimeBox value={timeLeft.seconds} label="Seconds" />
                                    </div>
                                ) : (
                                    <p className="text-xl font-semibold" style={{color: '#A62639'}}>The big day is here!</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg sm:text-xl font-bold tracking-wide">Thiruverkadu Temple</p>
                                <p className="text-sm sm:text-base">Thiruverkadu, Chennai - 600071</p>
                            </div>
                            <div className="pt-8">
                                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center btn-primary">
                                    <MapPinIcon />
                                    View Location
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-8 animate-fade-in delay-1200">
                        <div className="glass-card p-6 sm:p-8 space-y-8">
                            <h2 className="font-cinzel-decorative text-2xl sm:text-3xl tracking-wider" style={{color: '#A62639'}}>
                                Our Guestbook & RSVP
                            </h2>
                            {isSubmitted ? (
                                <div className="text-center space-y-4 py-8">
                                    <CheckCircleIcon className="w-20 h-20 text-emerald-600 mx-auto" />
                                    <p className="font-semibold text-2xl" style={{color: '#4D2424'}}>Thank you for your response!</p>
                                    <p className="text-lg">We can't wait to celebrate with you.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleRsvpSubmit} className="space-y-6 max-w-lg mx-auto">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="font-semibold text-lg">1. Please enter your name</label>
                                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Full Name" required className="form-input text-center"/>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-semibold text-lg">2. Will you be joining us?</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div onClick={() => setRsvpStatus('yes')} aria-pressed={rsvpStatus === 'yes'} className={`rsvp-choice-card ${rsvpStatus === 'yes' ? 'selected' : ''}`}>
                                                <HeartIcon className="w-8 h-8 mx-auto mb-2 choice-icon" />
                                                <span className="font-semibold text-lg">Joyfully Attending</span>
                                            </div>
                                            <div onClick={() => setRsvpStatus('no')} aria-pressed={rsvpStatus === 'no'} className={`rsvp-choice-card ${rsvpStatus === 'no' ? 'selected' : ''}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto mb-2 choice-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                                <span className="font-semibold text-lg">Regretfully Decline</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                         <label htmlFor="message" className="font-semibold text-lg">3. Leave a message (optional)</label>
                                        <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share your blessings..." rows={3} className="form-input" />
                                    </div>
                                    <div>
                                        <button type="submit" className="btn-primary w-full">Send RSVP</button>
                                    </div>
                                </form>
                            )}
                            
                            {/* Guest List Display */}
                            <div className="pt-4">
                                {isLoadingRsvps ? <p>Loading responses...</p>
                                : fetchError ? <p className="text-red-800">{fetchError}</p>
                                : (
                                    <div>
                                        <div className="guest-list-tabs">
                                            <div onClick={() => setActiveTab('attending')} className={`guest-list-tab ${activeTab === 'attending' ? 'active' : ''}`}>
                                                Attending ({attending.length})
                                            </div>
                                            <div onClick={() => setActiveTab('regrets')} className={`guest-list-tab ${activeTab === 'regrets' ? 'active' : ''}`}>
                                                Sending Wishes ({regrets.length})
                                            </div>
                                        </div>
                                        <div className="pt-4 text-center">
                                            {activeTab === 'attending' && (
                                                <div className="flex flex-wrap justify-center">
                                                    {attending.length > 0 ? attending.map((r, i) => <span key={i} className="guest-chip">{r.name}</span>) : <p>Be the first to RSVP!</p>}
                                                </div>
                                            )}
                                            {activeTab === 'regrets' && (
                                                <div className="flex flex-wrap justify-center">
                                                    {regrets.length > 0 ? regrets.map((r, i) => <span key={i} className="guest-chip">{r.name}</span>) : <p>No regrets yet!</p>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                         </div>
                     </div>
                     <div className="h-40"></div>
                </div>
            </main>
        </div>
    );
}

export default App;