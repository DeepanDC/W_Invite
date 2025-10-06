import React, { useState, useEffect } from 'react';

// Helper icon component defined outside the main component to prevent re-creation on render.
const MapPinIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5 mr-2" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

// Helper divider component for thematic separation of content.
const FloralDivider: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`my-6 text-center ${className || ''}`}>
        <span className="text-4xl text-amber-800 opacity-70">
            ~ &nbsp; ॐ &nbsp; ~
        </span>
    </div>
);

// Helper component for a single time unit in the countdown
const TimeBox: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center justify-center bg-amber-100/50 p-3 sm:p-4 rounded-lg shadow-inner w-20 sm:w-24">
        <span className="text-3xl sm:text-4xl font-semibold text-amber-900">{value.toString().padStart(2, '0')}</span>
        <span className="text-xs sm:text-sm uppercase tracking-widest">{label}</span>
    </div>
);

// FIX: Define an interface for the countdown timer's state for better type safety.
interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}


function App() {
    const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=The+Grand+Palace+Hall,+Bengaluru';
    
    // RSVP State
    const [rsvpStatus, setRsvpStatus] = useState<'yes' | 'no' | null>(null);
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [savedResponse, setSavedResponse] = useState<{status: 'yes' | 'no', message: string} | null>(null);

    // Countdown Timer State
    // FIX: Refactor to return a typed object or null for clarity and type safety.
    const calculateTimeLeft = (): TimeLeft | null => {
        const weddingDate = new Date('2025-12-07T17:00:00').getTime();
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
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        
        return () => clearTimeout(timer);
    });
    
    // LocalStorage Effect for RSVP
    useEffect(() => {
        try {
            const savedRsvp = localStorage.getItem('weddingRSVP');
            if (savedRsvp) {
                const parsedRsvp = JSON.parse(savedRsvp);
                setSavedResponse(parsedRsvp);
                setIsSubmitted(true);
            }
        } catch (error) {
            console.error("Failed to parse RSVP from localStorage", error);
        }
    }, []);

    const handleRsvpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rsvpStatus) {
            alert('Please select whether you can attend.');
            return;
        }
        const rsvpData = {
            status: rsvpStatus,
            message: message
        };
        try {
            localStorage.setItem('weddingRSVP', JSON.stringify(rsvpData));
            setIsSubmitted(true);
            setSavedResponse(rsvpData);
        } catch (error) {
            console.error("Failed to save RSVP to localStorage", error);
            alert("Sorry, we couldn't save your response. Please try again.");
        }
    };
    
    // FIX: Use a simple truthy check which acts as a type guard for the `timeLeft` object, resolving the type errors.
    const timerComponents = timeLeft ? (
        <div className="flex justify-center gap-2 sm:gap-4">
            <TimeBox value={timeLeft.days} label="Days" />
            <TimeBox value={timeLeft.hours} label="Hours" />
            <TimeBox value={timeLeft.minutes} label="Minutes" />
            <TimeBox value={timeLeft.seconds} label="Seconds" />
        </div>
    ) : (
        <p className="text-2xl font-semibold text-amber-900">The big day is here!</p>
    );


    return (
        <div 
            className="min-h-screen w-full bg-no-repeat bg-cover bg-top"
            style={{ backgroundImage: `url('Picsart_25-10-06_05-26-07-931.png')` }}
        >
            <main className="min-h-screen w-full flex flex-col items-center justify-start p-4 sm:p-8 overflow-y-auto">
                <div className="w-full max-w-lg text-center text-amber-950 space-y-4 pt-32 sm:pt-40 md:pt-48 pb-16">
                    
                    <h2 className="text-2xl sm:text-3xl tracking-widest uppercase font-semibold animate-fade-in delay-200">
                        Wedding Invitation
                    </h2>

                    <FloralDivider className="animate-fade-in delay-400" />

                    <p className="text-lg sm:text-xl leading-relaxed animate-fade-in delay-600">
                        Together with their beloved families
                    </p>

                    <h1 className="font-tangerine text-7xl sm:text-8xl text-amber-900 my-2 animate-fade-in-scale delay-800">
                        Deepan Chakravarthy<br/>
                        <span className="text-5xl sm:text-7xl">&</span><br/>
                        Deepa
                    </h1>

                    <p className="text-lg sm:text-xl leading-relaxed animate-fade-in delay-1000">
                        joyfully invite you to celebrate their union as they<br/>
                        begin their new life together.
                    </p>
                    
                    <div className="animate-fade-in delay-1200">
                        <FloralDivider />

                        <div className="space-y-3 text-lg sm:text-xl font-semibold">
                            <p>Sunday, 7th December 2025</p>
                            <p>Ceremony from 5:00 PM onwards</p>
                        </div>
                        
                        {/* Countdown Timer */}
                        <div className="py-6">
                           {timerComponents}
                        </div>

                        <p className="text-base sm:text-lg leading-relaxed mt-2">
                            Followed by Dinner & Reception
                        </p>
                    </div>

                    <div className="animate-fade-in delay-1400">
                        <div className="pt-6">
                            <p className="text-xl sm:text-2xl font-bold tracking-wide">
                                The Grand Palace Hall
                            </p>
                            <p className="text-base sm:text-lg">
                                Palace Grounds, Bengaluru, Karnataka
                            </p>
                        </div>

                        <div className="pt-8">
                            <a 
                                href={googleMapsUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-8 py-3 bg-[#c06c45] text-white rounded-full shadow-lg hover:bg-[#a85a36] transition-all duration-300 transform hover:scale-105"
                            >
                                <MapPinIcon />
                                View Location
                            </a>
                        </div>
                    </div>
                    
                    {/* RSVP Section */}
                    <div className="pt-10 animate-fade-in delay-1400">
                        <FloralDivider />
                        <div className="space-y-6">
                            <h2 className="text-3xl sm:text-4xl font-semibold tracking-wide">
                                Will you be joining us?
                            </h2>
                            {isSubmitted && savedResponse ? (
                                <div className="text-lg bg-amber-100/50 p-6 rounded-lg shadow-inner">
                                    <p className="font-semibold text-xl">Thank you for your response!</p>
                                    <p className="mt-2">
                                        You responded: <span className="font-bold">{savedResponse.status === 'yes' ? "I'll be there!" : "Regretfully Decline"}</span>
                                    </p>
                                    {savedResponse.message && (
                                        <p className="mt-2 italic">Your message: "{savedResponse.message}"</p>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleRsvpSubmit} className="space-y-6">
                                    <div className="flex justify-center gap-4">
                                        <button 
                                            type="button" 
                                            onClick={() => setRsvpStatus('yes')}
                                            aria-pressed={rsvpStatus === 'yes'}
                                            className={`px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md ${rsvpStatus === 'yes' ? 'bg-[#c06c45] text-white ring-2 ring-offset-2 ring-offset-amber-50 ring-[#a85a36]' : 'bg-white/70 hover:bg-white'}`}
                                        >
                                            Yes, I'll be there!
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setRsvpStatus('no')}
                                            aria-pressed={rsvpStatus === 'no'}
                                            className={`px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md ${rsvpStatus === 'no' ? 'bg-[#c06c45] text-white ring-2 ring-offset-2 ring-offset-amber-50 ring-[#a85a36]' : 'bg-white/70 hover:bg-white'}`}
                                        >
                                            No, I can't make it
                                        </button>
                                    </div>
                                    <div>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Leave a message for the couple (optional)"
                                            rows={3}
                                            className="w-full max-w-sm mx-auto p-3 bg-white/70 rounded-lg shadow-inner placeholder-amber-900/60 focus:outline-none focus:ring-2 focus:ring-[#c06c45]"
                                        />
                                    </div>
                                    <div>
                                        <button 
                                            type="submit"
                                            className="inline-flex items-center justify-center px-8 py-3 bg-[#c06c45] text-white rounded-full shadow-lg hover:bg-[#a85a36] transition-all duration-300 transform hover:scale-105"
                                        >
                                            Send RSVP
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                     <div className="h-40"></div> {/* Spacer to ensure content can be scrolled fully into view */}
                </div>
            </main>
        </div>
    );
}

export default App;