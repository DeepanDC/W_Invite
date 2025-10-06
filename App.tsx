import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- Firebase SDK (global scripts) ---
declare const firebase: any;

// =================================================================================
// --- Firebase Configuration ---
// =================================================================================
interface FirebaseConfig {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
}
const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyC15fnGgUVtMilRpKR7CL_F-XETFhStMZA",
  authDomain: "dcwithdd.firebaseapp.com",
  projectId: "dcwithdd",
  storageBucket: "dcwithdd.appspot.com",
  messagingSenderId: "184997850239",
  appId: "1:184997850239:web:a6e92200e484c95b8be34a"
};
// =================================================================================

// --- Initialize Firebase ---
let db: any, storage: any;
try {
    if (firebaseConfig.projectId && typeof firebase !== 'undefined') {
        const app = firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        storage = firebase.storage();
    }
} catch (e) {
    console.error("Firebase initialization failed. Please provide your config.", e);
}


// --- RSVP Backend ---
const RSVP_BACKEND_URL = 'https://api.npoint.io/3a876920ab8241b65645';

// --- Type Definitions ---
interface TimeLeft { days: number; hours: number; minutes: number; seconds: number; }
interface RsvpEntry { name: string; status: 'yes' | 'no'; message: string; }
interface Memory { id: string; url: string; uploaderName: string; message: string; type: 'image' | 'video'; createdAt: any; }

// --- Animated Background Components ---
const AnimatedFloralBackground: React.FC<{ direction: 'up' | 'down' }> = ({ direction }) => (
    <div className="petals-container">
        {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={`petal ${direction === 'up' ? 'petal-bottom' : 'petal-top'}`}></div>
        ))}
    </div>
);

// --- Themed SVG Icon Components ---
const MapPinIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg> );
const OrnateDivider: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => ( <div className={`py-6 text-center text-primary ${className || ''}`} style={style}><svg width="150" height="30" viewBox="0 0 150 30" className="inline-block" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 15H50" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.5"/><path d="M100 15H150" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.5"/><path d="M75 21C78.3137 21 81 18.3137 81 15C81 11.6863 78.3137 9 75 9C71.6863 9 69 11.6863 69 15C69 18.3137 71.6863 21 75 21Z" stroke="currentColor" strokeOpacity="0.8" strokeWidth="1.5"/><path d="M65.5 15C65.5 19.1421 69.8579 22.5 75 22.5C80.1421 22.5 84.5 19.1421 84.5 15C84.5 10.8579 80.1421 7.5 75 7.5C69.8579 7.5 65.5 10.8579 65.5 15Z" stroke="#FFBF00" strokeOpacity="0.7" strokeWidth="1"/><path d="M75 5V0M75 30V25M90 15H95M55 15H60" stroke="#FFBF00" strokeOpacity="0.6" strokeWidth="1" strokeLinecap="round"/></svg></div> );
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> );
const HeartIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg> );
const SunIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> );
const MoonIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> );
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>);
const PlayIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>);

const TimeBox: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center justify-center w-16 sm:w-20">
        <span className="text-2xl sm:text-3xl font-bold text-secondary">{value.toString().padStart(2, '0')}</span>
        <span className="text-xs sm:text-sm uppercase tracking-wider text-primary">{label}</span>
    </div>
);

function App() {
    const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=Thiruverkadu+Temple,+Chennai';
    
    // RSVP State
    const [name, setName] = useState('');
    const [rsvpStatus, setRsvpStatus] = useState<'yes' | 'no' | null>(null);
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [rsvpList, setRsvpList] = useState<RsvpEntry[]>([]);
    const [isLoadingRsvps, setIsLoadingRsvps] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'attending' | 'regrets'>('attending');
    
    // Memory Gallery State
    const [memories, setMemories] = useState<Memory[]>([]);
    const [galleryError, setGalleryError] = useState<string | null>(null);
    const [uploaderName, setUploaderName] = useState('');
    const [uploadMessage, setUploadMessage] = useState('');
    const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Theme State
    const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('wedding-theme') as 'light' | 'dark') || 'light');

    // Theme Effect
    useEffect(() => {
        localStorage.setItem('wedding-theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    // Countdown Timer
    const calculateTimeLeft = useCallback((): TimeLeft | null => {
        const weddingDate = new Date('2025-12-07T06:30:00').getTime();
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
    
    // --- Memory Gallery Firebase Logic ---
    useEffect(() => {
        if (!db) {
            setGalleryError("Gallery is not available. Firebase config missing.");
            return;
        }
        const memoriesCollection = db.collection("memories").orderBy("createdAt", "desc");
        const unsubscribe = memoriesCollection.onSnapshot(
            (querySnapshot: any) => {
                const memoriesData: Memory[] = [];
                querySnapshot.forEach((doc: any) => {
                    memoriesData.push({ id: doc.id, ...doc.data() } as Memory);
                });
                setMemories(memoriesData);
                setGalleryError(null);
            },
            (error: any) => {
                console.error("Error fetching memories:", error);
                setGalleryError("Could not load memories from the gallery.");
            }
        );
        return () => unsubscribe();
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFilesToUpload(Array.from(e.target.files));
        }
    };

    const handleRemoveFile = (index: number) => {
        setFilesToUpload(files => files.filter((_, i) => i !== index));
    };
    
    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (filesToUpload.length === 0) return alert("Please select files to upload.");
        if (!uploaderName.trim()) return alert("Please enter your name.");
        if (!storage || !db) return alert("Upload service is not available.");

        setIsUploading(true);
        setUploadProgress(0);

        for (let i = 0; i < filesToUpload.length; i++) {
            const file = filesToUpload[i];
            const fileId = `${Date.now()}-${file.name}`;
            const storageRef = storage.ref(`memories/${fileId}`);
            const uploadTask = storageRef.put(file);

            await new Promise<void>((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot: any) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        const totalProgress = ((i / filesToUpload.length) * 100) + (progress / filesToUpload.length);
                        setUploadProgress(totalProgress);
                    },
                    (error: any) => {
                        console.error("Upload failed:", error);
                        reject(error);
                    },
                    async () => {
                        try {
                            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                            await db.collection("memories").add({
                                uploaderName: uploaderName.trim(),
                                message: uploadMessage.trim(),
                                url: downloadURL,
                                type: file.type.startsWith('video') ? 'video' : 'image',
                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                            resolve();
                        } catch (error) {
                            console.error("Failed to save memory metadata:", error);
                            reject(error);
                        }
                    }
                );
            });
        }

        setIsUploading(false);
        setUploadProgress(null);
        setFilesToUpload([]);
        setUploaderName('');
        setUploadMessage('');
    };

    const filePreviews = useMemo(() => 
        filesToUpload.map(file => URL.createObjectURL(file)),
    [filesToUpload]);

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
                        <h1 className="font-alex-brush text-5xl sm:text-6xl my-2 animate-fade-in-scale delay-600 text-shadow-gold text-primary">Deepan Chakravarthy<br/><span className="font-cinzel-decorative text-2xl sm:text-3xl">&</span><br/>Deepa</h1>
                        <p className="text-base sm:text-lg leading-relaxed pt-4 animate-fade-in delay-800 text-secondary">Join us as we begin our new life together.</p>
                        <div className="animate-fade-in delay-1000">
                            <OrnateDivider />
                            <div className="space-y-2 text-base sm:text-lg font-semibold text-secondary">
                                <p>Sunday, 7th December 2025</p>
                                <p>Ceremony between 6:30 am to 7:30 am</p>
                            </div>
                            <div className="py-8">
                                {timeLeft ? (<div className="flex justify-center gap-2 sm:gap-4"><TimeBox value={timeLeft.days} label="Days" /><TimeBox value={timeLeft.hours} label="Hours" /><TimeBox value={timeLeft.minutes} label="Minutes" /><TimeBox value={timeLeft.seconds} label="Seconds" /></div>) 
                                : (<p className="text-xl font-semibold text-primary">The big day is here!</p>)}
                            </div>
                            <div className="space-y-1 text-secondary">
                                <p className="text-lg sm:text-xl font-bold tracking-wide">Thiruverkadu Temple</p>
                                <p className="text-sm sm:text-base">Thiruverkadu, Chennai - 600071</p>
                            </div>
                            <div className="pt-8"><a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center btn-primary"><MapPinIcon /> View Location</a></div>
                        </div>
                    </div>
                    
                    {/* --- RSVP & GUESTBOOK CARD --- */}
                    <div className="pt-8 animate-fade-in delay-1200">
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

                    {/* --- MEMORY GALLERY CARD --- */}
                    <div className="pt-8 animate-fade-in delay-1400">
                        <div className="glass-card p-6 sm:p-8 space-y-6">
                            <h2 className="font-cinzel-decorative text-2xl sm:text-3xl tracking-wider text-primary">Share Your Memories</h2>
                            
                            <form onSubmit={handleUploadSubmit} className="space-y-4">
                               <input id="uploaderName" type="text" value={uploaderName} onChange={(e) => setUploaderName(e.target.value)} placeholder="Your Name" required className="form-input text-center"/>
                               <textarea id="uploadMessage" value={uploadMessage} onChange={(e) => setUploadMessage(e.target.value)} placeholder="Add a message... (optional)" rows={2} className="form-input" />
                               
                               <input type="file" id="file-upload" className="hidden" multiple onChange={handleFileSelect} accept="image/*,video/*" />
                               <label htmlFor="file-upload" className="file-input-label block text-primary">
                                   <UploadIcon className="w-8 h-8 mx-auto mb-2" />
                                   <span className="font-semibold">Click to select photos & videos</span>
                               </label>

                               {filePreviews.length > 0 && (
                                   <div className="file-preview-grid">
                                       {filePreviews.map((src, i) => (
                                           <div key={i} className="file-preview-item">
                                               <img src={src} alt={`preview ${i}`} className="file-preview-img" />
                                               <button type="button" onClick={() => handleRemoveFile(i)} className="file-preview-remove">&times;</button>
                                           </div>
                                       ))}
                                   </div>
                               )}
                               
                               {isUploading && uploadProgress !== null && (
                                   <div className="space-y-2 pt-2">
                                       <p className="text-center font-semibold text-secondary">Uploading... {Math.round(uploadProgress)}%</p>
                                       <div className="progress-bar-bg h-2 w-full"><div className="progress-bar-fg" style={{ width: `${uploadProgress}%` }}></div></div>
                                   </div>
                               )}

                               <button type="submit" className="btn-primary w-full" disabled={isUploading || filesToUpload.length === 0}>
                                   {isUploading ? 'Uploading...' : 'Share Memories'}
                               </button>
                            </form>
                            
                            <div className="pt-4">
                                {galleryError && <p className="text-red-500">{galleryError}</p>}
                                {memories.length === 0 && !galleryError && <p className="text-secondary">Be the first to share a memory!</p>}
                                <div className="gallery-grid">
                                    {memories.map((mem, index) => (
                                        <div key={mem.id} className="gallery-item" onClick={() => setLightboxIndex(index)}>
                                            {mem.type === 'image' ? (
                                                <img src={mem.url} alt={mem.message} />
                                            ) : (
                                                <>
                                                    <video src={mem.url} muted playsInline />
                                                    <div className="play-icon"><PlayIcon/></div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                     <div className="h-40"></div>
                </div>
            </main>
            
            {lightboxIndex !== null && (
                <div className="lightbox" onClick={() => setLightboxIndex(null)}>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        {memories[lightboxIndex].type === 'image' ? (
                            <img src={memories[lightboxIndex].url} alt={memories[lightboxIndex].message} />
                        ) : (
                            <video src={memories[lightboxIndex].url} controls autoPlay playsInline />
                        )}
                        <div className="lightbox-caption">
                            <p className="font-bold">{memories[lightboxIndex].uploaderName}</p>
                            <p>{memories[lightboxIndex].message}</p>
                        </div>
                    </div>
                    <button onClick={() => setLightboxIndex(null)} className="lightbox-close">&times;</button>
                    {lightboxIndex > 0 && <button onClick={() => setLightboxIndex(i => i! - 1)} className="lightbox-nav lightbox-prev">&#10094;</button>}
                    {lightboxIndex < memories.length - 1 && <button onClick={() => setLightboxIndex(i => i! + 1)} className="lightbox-nav lightbox-next">&#10095;</button>}
                </div>
            )}
        </div>
    );
}

export default App;