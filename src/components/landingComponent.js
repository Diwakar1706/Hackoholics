



// //3rd change for scroll bar


// import React, { useState, useEffect, useRef, useCallback } from 'react';
// // Import icons from lucide-react
// import { Bike, Bus, Car, Plane, TramFront, Train, Walk, Wallet, Clock, CloudOff, CheckCircle, Star, Footprints } from 'lucide-react';

// // --- Reusable Components (Basic Styling) ---
// const Label = ({ children, ...props }) => <label className="block text-sm font-medium text-gray-700 mb-1" {...props}>{children}</label>;
// const Input = React.forwardRef((props, ref) => <input ref={ref} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400" {...props} />);
// const Button = ({ children, className = '', Icon = null, ...props }) => (
//     <button
//         className={`inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out ${className}`}
//         {...props}
//     >
//         {Icon && <Icon className="mr-2 h-4 w-4" />}
//         {children}
//     </button>
// );
// const Select = ({ children, ...props }) => <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white" {...props}>{children}</select>;
// const Card = ({ children, className = '', ...props }) => <div className={`bg-white shadow-lg rounded-lg overflow-hidden flex flex-col ${className}`} {...props}>{children}</div>;
// const CardHeader = ({ children, className = '', ...props }) => <div className={`p-4 border-b border-gray-200 ${className}`} {...props}>{children}</div>;
// const CardTitle = ({ children, className = '', Icon = null, ...props }) => (
//     <h3 className={`text-lg leading-6 font-semibold text-gray-900 flex items-center ${className}`} {...props}>
//         {Icon && <Icon className="mr-2 h-5 w-5 text-indigo-600" />}
//         {children}
//     </h3>
// );
// const CardContent = ({ children, className = '', ...props }) => <div className={`p-4 flex-grow ${className}`} {...props}>{children}</div>;

// // --- Icon Mapping ---
// const modeIcons = {
//     "Walking": Footprints,
//     "Cycling": Bike,
//     "Bus": Bus,
//     "Metro": TramFront, // Using TramFront for Metro/Subway
//     "Train": Train,
//     "Taxi/Rideshare": Car, // Using Car for Taxi/Rideshare
//     "Private Car": Car,
//     "Flight": Plane,
//     "Default": Star // Fallback icon
// };

// // --- Main Component ---
// const LandingComponent = () => {
//     // --- State Variables (Keep as before) ---
//     const [startLocation, setStartLocation] = useState('');
//     const [endLocation, setEndLocation] = useState('');
//     const [preference, setPreference] = useState('greenest');
//     const [comparisonResults, setComparisonResults] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [isSaving, setIsSaving] = useState(false);
//     const [error, setError] = useState(null);
//     const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

//     // --- Location Suggestions State (Keep as before) ---
//     const [startSuggestions, setStartSuggestions] = useState([]);
//     const [endSuggestions, setEndSuggestions] = useState([]);
//     const [activeInput, setActiveInput] = useState(null);
//     const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
//     const debounceTimeoutRef = useRef(null);
//     const startInputContainerRef = useRef(null);
//     const endInputContainerRef = useRef(null);

//     // API endpoint URLs (Keep as before)
//     const COMPARE_API_URL = 'http://127.0.0.1:8000/compare';
//     const SAVE_CHOICE_API_URL = 'http://127.0.0.1:8000/save_choice';
//     const LOCATION_API_URL = 'https://nominatim.openstreetmap.org/search';

//     // --- Effects (Keep as before) ---
//      useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (
//                 startInputContainerRef.current &&
//                 !startInputContainerRef.current.contains(event.target) &&
//                 endInputContainerRef.current &&
//                 !endInputContainerRef.current.contains(event.target)
//             ) {
//                 setActiveInput(null);
//                 setStartSuggestions([]);
//                 setEndSuggestions([]);
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     // --- Location Suggestion Logic (Keep as before) ---
//      const fetchLocationSuggestions = useCallback(async (query, type) => {
//         if (!query || query.length < 3) {
//             type === 'start' ? setStartSuggestions([]) : setEndSuggestions([]);
//             return;
//         }
//         setIsFetchingSuggestions(true);
//         try {
//             const response = await fetch(
//                 `${LOCATION_API_URL}?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in` // Added country code for India
//             );
//             if (!response.ok) throw new Error('Failed to fetch suggestions');
//             const data = await response.json();
//             // Filter suggestions to be more relevant if possible (e.g., check type)
//             const suggestions = data
//                 .map(item => ({ name: item.display_name }))
//                 .filter((s, i, arr) => arr.findIndex(t => t.name === s.name) === i); // Basic duplicate filter

//             if (type === 'start') setStartSuggestions(suggestions);
//             else setEndSuggestions(suggestions);
//         } catch (err) {
//             console.error("Suggestion fetch error:", err);
//             setStartSuggestions([]); setEndSuggestions([]);
//         } finally {
//             setIsFetchingSuggestions(false);
//         }
//     }, []); // Dependency LOCATION_API_URL

//     const handleLocationInputChange = (e, type) => {
//         const value = e.target.value;
//         setActiveInput(type);
//         if (type === 'start') setStartLocation(value);
//         else setEndLocation(value);

//         if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
//         debounceTimeoutRef.current = setTimeout(() => {
//             fetchLocationSuggestions(value, type);
//         }, 500); // 500ms debounce
//     };

//      const handleSuggestionClick = (suggestion, type) => {
//         if (type === 'start') {
//             setStartLocation(suggestion.name); setStartSuggestions([]);
//         } else {
//             setEndLocation(suggestion.name); setEndSuggestions([]);
//         }
//         setActiveInput(null); // Close suggestions on click
//     };

//     // --- Event Handlers (Keep core logic as before) ---
//     const handleCompareOptions = async (e) => {
//         e.preventDefault();
//         if (!startLocation || !endLocation) {
//             setError('Please enter both Start and End locations.');
//             return;
//         }
//         setIsLoading(true); setError(null); setComparisonResults([]); setSaveSuccessMessage('');
//         try {
//             const requestBody = { start_location: startLocation, end_location: endLocation, preference: preference, user_message: `Compare options from ${startLocation} to ${endLocation} preferring ${preference}` };
//             const response = await fetch(COMPARE_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(requestBody) });
//             if (!response.ok) { /* ... error handling ... */
//                  let errorDetail = `HTTP error! Status: ${response.status}`;
//                  try { const errorData = await response.json(); errorDetail = errorData.detail || errorDetail; }
//                  catch (jsonError) { errorDetail = response.statusText || errorDetail; }
//                  throw new Error(errorDetail);
//             }
//             const data = await response.json();
//             if (Array.isArray(data)) { setComparisonResults(data); }
//             else { throw new Error("Invalid comparison data received."); }
//         } catch (err) { console.error("API Call failed:", err); setError(err.message || 'Failed to fetch comparison.'); setComparisonResults([]); }
//         finally { setIsLoading(false); }
//     };

//     const handleChooseOption = async (chosenOption) => {
//         setIsSaving(true); setError(null); setSaveSuccessMessage('');
//         try {
//             const choiceData = { start_location: startLocation, end_location: endLocation, preference: preference, mode: chosenOption.mode, distance_km: chosenOption.distance_km, time_minutes: chosenOption.time_minutes, co2_emission_g: chosenOption.co2_emission_g, estimated_cost: chosenOption.estimated_cost, co2_saved_g: chosenOption.co2_saved_g, booking_link: chosenOption.booking_link };
//             const response = await fetch(SAVE_CHOICE_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(choiceData) });
//             if (!response.ok) { /* ... error handling ... */
//                  let errorDetail = `HTTP error! Status: ${response.status}`;
//                  try { const errorData = await response.json(); errorDetail = errorData.detail || errorDetail; }
//                  catch (jsonError) { errorDetail = response.statusText || errorDetail; }
//                  throw new Error(errorDetail);
//             }
//             const result = await response.json();
//             setSaveSuccessMessage(result.message || 'Choice saved successfully!');
//         } catch (err) { console.error("Save choice failed:", err); setError(err.message || 'Failed to save choice.'); }
//         finally { setIsSaving(false); }
//     };

//     // --- Helper Function to Render Option Details with Icons ---
//     const renderOptionDetails = (option) => (
//         <ul className="text-sm space-y-2 text-gray-700">
//             <li className="flex items-center"><strong className="w-24 inline-block">Distance:</strong> {option.distance_km ?? 'N/A'} km</li>
//             <li className="flex items-center"><Clock className="mr-2 h-4 w-4 text-gray-500" /><strong className="w-20 inline-block">Time:</strong> {option.time_minutes ?? 'N/A'} min</li>
//             <li className="flex items-center"><CloudOff className="mr-2 h-4 w-4 text-gray-500" /><strong className="w-20 inline-block">CO₂ Emitted:</strong> {option.co2_emission_g ?? 'N/A'} g</li>
//             <li className="flex items-center"><Wallet className="mr-2 h-4 w-4 text-gray-500" /><strong className="w-20 inline-block">Est. Cost:</strong> {option.estimated_cost || 'N/A'}</li>
//             <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /><strong className="w-20 inline-block">CO₂ Saved:</strong> {option.co2_saved_g ?? 'N/A'} g</li>
//             <li className="flex items-center">
//                  <strong className="w-24 inline-block">Booking:</strong>
//                  {option.booking_link && option.booking_link !== 'N/A' ? (
//                     <a href={option.booking_link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline hover:text-indigo-800 transition duration-150 ease-in-out">
//                         Check Link
//                     </a>
//                 ) : (
//                     'N/A'
//                 )}
//             </li>
//         </ul>
//     );

//     // --- JSX Rendering ---
//     return (
//         <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-sans">
//             {/* Header */}
//             <header className="bg-white text-gray-800 p-4 shadow-md flex-shrink-0 border-b border-gray-200">
//                 <h1 className="text-xl font-bold text-indigo-700">Sustainable Travel Comparator</h1>
//             </header>

//             {/* Main Content Area */}
//             <div className="flex flex-col md:flex-row flex-1 overflow-hidden p-4 md:p-6 gap-6">

//                 {/* Configuration Panel */}
//                 <Card className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 border border-gray-200">
//                     <CardHeader>
//                         <CardTitle>Plan Your Trip</CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-5">
//                          {/* Start Location */}
//                         <div className="relative" ref={startInputContainerRef}>
//                             <Label htmlFor="start-location">From</Label>
//                             <Input id="start-location" type="text" value={startLocation} onChange={(e) => handleLocationInputChange(e, 'start')} placeholder="Enter starting point" disabled={isLoading || isSaving} autoComplete="off" onFocus={() => setActiveInput('start')} />
//                             {activeInput === 'start' && (startSuggestions.length > 0 || isFetchingSuggestions) && (
//                                 <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
//                                     {isFetchingSuggestions && <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>}
//                                     {!isFetchingSuggestions && startSuggestions.map((s, i) => <div key={i} className="px-3 py-2 text-sm hover:bg-indigo-100 cursor-pointer truncate" onClick={() => handleSuggestionClick(s, 'start')}>{s.name}</div>)}
//                                 </div>
//                             )}
//                         </div>
//                         {/* End Location */}
//                          <div className="relative" ref={endInputContainerRef}>
//                             <Label htmlFor="end-location">To</Label>
//                             <Input id="end-location" type="text" value={endLocation} onChange={(e) => handleLocationInputChange(e, 'end')} placeholder="Enter destination" disabled={isLoading || isSaving} autoComplete="off" onFocus={() => setActiveInput('end')} />
//                              {activeInput === 'end' && (endSuggestions.length > 0 || isFetchingSuggestions) && (
//                                 <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
//                                      {isFetchingSuggestions && <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>}
//                                      {!isFetchingSuggestions && endSuggestions.map((s, i) => <div key={i} className="px-3 py-2 text-sm hover:bg-indigo-100 cursor-pointer truncate" onClick={() => handleSuggestionClick(s, 'end')}>{s.name}</div>)}
//                                  </div>
//                              )}
//                         </div>
//                         {/* Preference */}
//                         {/* <div>
//                             <Label htmlFor="preference">Prioritize</Label>
//                             <Select id="preference" value={preference} onChange={(e) => setPreference(e.target.value)} disabled={isLoading || isSaving}>
//                                 <option value="greenest">Lowest CO₂ (Greenest)</option>
//                                 <option value="fastest">Shortest Time (Fastest)</option>
//                                 <option value="cheapest">Lowest Cost (Cheapest)</option>
//                                 <option value="balanced">Balanced</option>
//                             </Select>
//                         </div> */}
//                         {/* Action Button */}
//                         <Button
//                             onClick={handleCompareOptions}
//                             disabled={isLoading || isSaving || !startLocation || !endLocation}
//                             className="w-full mt-2"
//                         >
//                             {isLoading ? 'Comparing...' : 'Compare Options'}
//                         </Button>
//                         {/* Error/Success Messages */}
//                         <div className="h-6 mt-2"> {/* Reserve space for messages */}
//                             {error && <p className="text-red-600 text-sm text-center animate-pulse">{error}</p>}
//                             {saveSuccessMessage && <p className="text-green-600 text-sm text-center">{saveSuccessMessage}</p>}
//                         </div>
//                     </CardContent>
//                 </Card>

//                 {/* Comparison Results Panel */}
//                 <div className="flex-1 overflow-y-auto pb-4">
//                      <h2 className="text-xl font-semibold text-gray-800 mb-4">Travel Options</h2>
//                      {isLoading && (
//                         <div className="flex justify-center items-center h-40">
//                             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
//                         </div>
//                      )}
//                      {!isLoading && comparisonResults.length === 0 && !error && (
//                          <div className="text-center text-gray-500 p-10 bg-white rounded-lg shadow">Enter locations and click compare to see travel options.</div>
//                      )}
//                      {!isLoading && comparisonResults.length > 0 && (
//                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
//                              {comparisonResults.map((option, index) => {
//                                 const IconComponent = modeIcons[option.mode] || modeIcons.Default;
//                                 return (
//                                     <Card key={index} className={`transition duration-300 ease-in-out hover:shadow-xl ${option.is_recommended ? 'border-2 border-green-500 ring-2 ring-green-200' : 'border border-gray-200'}`}>
//                                         <CardHeader className="flex justify-between items-center bg-gray-50">
//                                             <CardTitle Icon={IconComponent}>{option.mode}</CardTitle>
//                                             {option.is_recommended && (
//                                                 <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
//                                                     <Star className="mr-1 h-3 w-3" /> Recommended
//                                                 </span>
//                                             )}
//                                         </CardHeader>
//                                         <CardContent>
//                                             {renderOptionDetails(option)}
//                                         </CardContent>
//                                         <div className="p-4 border-t border-gray-100 mt-auto"> {/* mt-auto pushes button down */}
//                                             <Button
//                                                 onClick={() => handleChooseOption(option)}
//                                                 disabled={isSaving}
//                                                 className="w-full text-sm bg-indigo-500 hover:bg-indigo-600"
//                                                 Icon={CheckCircle}
//                                             >
//                                                 {isSaving ? 'Saving...' : 'Select this Option'}
//                                             </Button>
//                                         </div>
//                                     </Card>
//                                 );
//                              })}
//                          </div>
//                      )}
//                  </div>
//             </div>
//         </div>
//     );
// }

// export default LandingComponent;






import React, { useState, useEffect, useRef, useCallback } from 'react';
// Import icons from lucide-react
import { Bike, Bus, Car, Plane, TramFront, Train, Walk, Wallet, Clock, CloudOff, CheckCircle, Star, Footprints, MessageSquare, X, Send, Loader2 } from 'lucide-react';

// --- Reusable Components (Basic Styling using Tailwind CSS) ---
// Label component for form inputs
const Label = ({ children, ...props }) => <label className="block text-sm font-medium text-gray-700 mb-1" {...props}>{children}</label>;
// Input component with forwardRef for accessing the DOM element
const Input = React.forwardRef((props, ref) => <input ref={ref} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400" {...props} />);
// Button component with optional icon
const Button = ({ children, className = '', Icon = null, ...props }) => (
    <button
        className={`inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out ${className}`}
        {...props}
    >
        {Icon && <Icon className="mr-2 h-4 w-4" />}
        {children}
    </button>
);
// Select dropdown component
const Select = ({ children, ...props }) => <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white" {...props}>{children}</select>;
// Card component for layout
const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white shadow-lg rounded-lg overflow-hidden flex flex-col ${className}`} {...props}>
    {children}
  </div>
);
// Card header component
const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`p-4 border-b border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);
// Card title component with optional icon
const CardTitle = ({ children, className = '', Icon = null, ...props }) => (
    <h3 className={`text-lg leading-6 font-semibold text-gray-900 flex items-center ${className}`} {...props}>
        {Icon && <Icon className="mr-2 h-5 w-5 text-indigo-600" />}
        {children}
    </h3>
);
// Card content component
const CardContent = ({ children, className = '', ...props }) => (
  <div className={`p-4 flex-grow ${className}`} {...props}>
    {children}
  </div>
);

// --- Icon Mapping for Travel Modes ---
const modeIcons = {
    "Walking": Footprints,
    "Cycling": Bike,
    "Bus": Bus,
    "Metro": TramFront, // Using TramFront for Metro/Subway
    "Train": Train,
    "Taxi/Rideshare": Car, // Using Car for Taxi/Rideshare
    "Private Car": Car,
    "Flight": Plane,
    "Default": Star // Fallback icon
};

// --- Chatbot Component ---
const Chatbot = () => {
    // State for chatbot visibility, messages, input, and loading status
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]); // Array of { sender: 'bot' | 'user', text: string | string[], recommendations?: string[] }
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null); // Ref to scroll to the bottom of messages
    const CHATBOT_API_URL = 'http://127.0.0.1:8000/chatbot'; // Backend API endpoint for the chatbot

    // Function to scroll the chat window to the latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Effect to scroll down when new messages are added
    useEffect(scrollToBottom, [messages]);

    // Effect to fetch initial recommendations when the chatbot is opened for the first time
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            fetchRecommendations(null); // Pass null message for initial fetch
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]); // Dependency on isOpen

    // Function to fetch recommendations/responses from the chatbot backend
    const fetchRecommendations = async (userMessage) => {
        setIsLoading(true); // Show loading indicator
        try {
            const response = await fetch(CHATBOT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                // Send null message for initial fetch, otherwise send user's message
                body: JSON.stringify({ message: userMessage })
            });

            // Handle HTTP errors
            if (!response.ok) {
                let errorDetail = `HTTP error! Status: ${response.status}`;
                try {
                    const errorData = await response.json(); // Try to get error details from response
                    errorDetail = errorData.detail || errorDetail;
                } catch (jsonError) {
                    // Ignore if response body is not JSON
                }
                throw new Error(errorDetail);
            }

            const data = await response.json(); // Expects { message: string, recommendations?: string[] }

            // Add bot's response message to the chat state
            const botMessage = {
                sender: 'bot',
                text: data.message,
                recommendations: data.recommendations || null // Attach recommendations if present
            };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Chatbot API error:", error);
            // Add an error message to the chat if the API call fails
            setMessages(prev => [...prev, { sender: 'bot', text: `Sorry, I couldn't connect. Error: ${error.message}` }]);
        } finally {
            setIsLoading(false); // Hide loading indicator
        }
    };

    // Handler for sending a message from the input field
    const handleSendMessage = (e) => {
        e.preventDefault(); // Prevent form submission from reloading the page
        const trimmedInput = inputValue.trim();
        if (!trimmedInput || isLoading) return; // Do nothing if input is empty or loading

        // Add user's message to the chat state
        setMessages(prev => [...prev, { sender: 'user', text: trimmedInput }]);
        setInputValue(''); // Clear the input field

        // Fetch the bot's response based on the user's message
        fetchRecommendations(trimmedInput);
    };

    // JSX for the Chatbot UI
    return (
        <>
            {/* Chat Bubble Toggle Button (visible when chat is closed) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-5 right-5 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 z-40" // High z-index to stay on top
                    aria-label="Open Chat"
                >
                    <MessageSquare size={24} />
                </button>
            )}

            {/* Chat Window (visible when chat is open) */}
            {isOpen && (
                <div className="fixed bottom-5 right-5 w-80 h-[450px] bg-white rounded-lg shadow-xl flex flex-col border border-gray-300 z-50"> {/* Higher z-index */}
                    {/* Chat Header */}
                    <div className="flex justify-between items-center p-3 bg-indigo-600 text-white rounded-t-lg">
                        <h3 className="font-semibold text-sm">Eco-Bot</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-indigo-100 hover:text-white focus:outline-none"
                            aria-label="Close Chat"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-grow p-3 overflow-y-auto space-y-3 text-sm">
                        {/* Map through messages and display them */}
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[80%] p-2 rounded-lg ${
                                        msg.sender === 'user'
                                            ? 'bg-indigo-100 text-gray-800' // User message style
                                            : 'bg-gray-200 text-gray-800' // Bot message style
                                    }`}
                                >
                                    {/* Display simple text or list of recommendations */}
                                    {typeof msg.text === 'string' && <p>{msg.text}</p>}
                                    {/* Display recommendations as a list if available */}
                                    {msg.recommendations && (
                                        <ul className="list-disc list-inside mt-1 space-y-1">
                                            {msg.recommendations.map((rec, i) => (
                                                <li key={i}>{rec}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        ))}
                        {/* Loading Indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 text-gray-800 p-2 rounded-lg inline-flex items-center space-x-2">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Thinking...</span>
                                </div>
                            </div>
                        )}
                         {/* Empty div used as a reference point for scrolling */}
                         <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input Area */}
                    <div className="p-3 border-t border-gray-200">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                            <Input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask about sustainability..."
                                className="flex-grow text-sm"
                                disabled={isLoading} // Disable input while loading
                                autoComplete="off"
                            />
                            <Button
                                type="submit"
                                className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                                disabled={isLoading || !inputValue.trim()} // Disable button if loading or input empty
                                aria-label="Send Message"
                            >
                                <Send size={18} />
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};


// --- Main Landing Page Component ---
const LandingComponent = () => {
    // --- State Variables ---
    const [startLocation, setStartLocation] = useState(''); // Input for start location
    const [endLocation, setEndLocation] = useState(''); // Input for end location
    const [preference, setPreference] = useState('greenest'); // User preference for comparison (greenest, fastest, cheapest, balanced)
    const [comparisonResults, setComparisonResults] = useState([]); // Stores results from the comparison API
    const [isLoading, setIsLoading] = useState(false); // Tracks loading state for comparison API call
    const [isSaving, setIsSaving] = useState(false); // Tracks loading state for saving choice API call
    const [error, setError] = useState(null); // Stores error messages
    const [saveSuccessMessage, setSaveSuccessMessage] = useState(''); // Stores success message after saving a choice

    // --- Location Suggestions State ---
    const [startSuggestions, setStartSuggestions] = useState([]); // Suggestions for start location input
    const [endSuggestions, setEndSuggestions] = useState([]); // Suggestions for end location input
    const [activeInput, setActiveInput] = useState(null); // Tracks which input ('start' or 'end') is currently active/focused
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false); // Tracks loading state for location suggestions API call
    const debounceTimeoutRef = useRef(null); // Ref for debouncing suggestion API calls
    const startInputContainerRef = useRef(null); // Ref for the start location input container (to detect clicks outside)
    const endInputContainerRef = useRef(null); // Ref for the end location input container

    // --- API Endpoint URLs ---
    const COMPARE_API_URL = 'http://127.0.0.1:8000/compare'; // API for comparing travel options
    const SAVE_CHOICE_API_URL = 'http://127.0.0.1:8000/save_choice'; // API for saving the user's chosen option
    const LOCATION_API_URL = 'https://nominatim.openstreetmap.org/search'; // API for location suggestions (OpenStreetMap Nominatim)

    // --- Effects ---
    // Effect to handle clicks outside the location input fields to close the suggestion dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click is outside both the start and end input containers
            if (
                startInputContainerRef.current &&
                !startInputContainerRef.current.contains(event.target) &&
                endInputContainerRef.current &&
                !endInputContainerRef.current.contains(event.target)
            ) {
                setActiveInput(null); // Deactivate inputs
                setStartSuggestions([]); // Clear start suggestions
                setEndSuggestions([]); // Clear end suggestions
            }
        };

        // Add event listener when the component mounts
        document.addEventListener('mousedown', handleClickOutside);
        // Remove event listener when the component unmounts
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []); // Empty dependency array means this effect runs only once on mount

    // --- Location Suggestion Logic ---
    // Function to fetch location suggestions from the Nominatim API
    const fetchLocationSuggestions = useCallback(async (query, type) => {
        // Don't fetch if query is too short
        if (!query || query.length < 3) {
            type === 'start' ? setStartSuggestions([]) : setEndSuggestions([]);
            return;
        }
        setIsFetchingSuggestions(true); // Show loading state for suggestions
        try {
            // Fetch suggestions from Nominatim API (limited to India, max 5 results)
            const response = await fetch(
                `${LOCATION_API_URL}?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in` // Added country code for India
            );
            if (!response.ok) throw new Error('Failed to fetch suggestions');
            const data = await response.json();

            // Process and filter suggestions (map to simple object and remove duplicates based on name)
            const suggestions = data
                .map(item => ({ name: item.display_name }))
                .filter((s, i, arr) => arr.findIndex(t => t.name === s.name) === i); // Basic duplicate filter

            // Update the appropriate suggestions state based on the input type ('start' or 'end')
            if (type === 'start') setStartSuggestions(suggestions);
             else setEndSuggestions(suggestions);
        } catch (err) {
            console.error("Suggestion fetch error:", err);
             // Clear suggestions on error
            setStartSuggestions([]);
            setEndSuggestions([]);
        } finally {
            setIsFetchingSuggestions(false); // Hide loading state
        }
    }, []); // No dependencies, LOCATION_API_URL is a constant

    // Handler for changes in the location input fields
    const handleLocationInputChange = (e, type) => {
        const value = e.target.value;
        setActiveInput(type); // Set the currently active input
        // Update the corresponding location state
        if (type === 'start') setStartLocation(value);
        else setEndLocation(value);

        // Debounce the suggestion fetch: wait 500ms after typing stops before fetching
        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = setTimeout(() => {
            fetchLocationSuggestions(value, type);
        }, 500); // 500ms debounce time
    };

    // Handler for clicking on a location suggestion
    const handleSuggestionClick = (suggestion, type) => {
        // Set the input value to the clicked suggestion's name
        if (type === 'start') {
            setStartLocation(suggestion.name);
            setStartSuggestions([]); // Clear suggestions
        } else {
            setEndLocation(suggestion.name);
            setEndSuggestions([]); // Clear suggestions
        }
        setActiveInput(null); // Close the suggestions dropdown
    };

    // --- Event Handlers for Comparison and Saving ---
    // Handler for the "Compare Options" button click
    const handleCompareOptions = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        // Basic validation: ensure both locations are entered
        if (!startLocation || !endLocation) {
            setError('Please enter both Start and End locations.');
            return;
        }
        // Reset states before making the API call
        setIsLoading(true);
        setError(null);
        setComparisonResults([]);
        setSaveSuccessMessage('');

        try {
            // Prepare the request body for the comparison API
            const requestBody = {
                start_location: startLocation,
                end_location: endLocation,
                preference: preference,
                // Include a user message for potential context in the backend (e.g., for an LLM)
                user_message: `Compare travel options from ${startLocation} to ${endLocation} preferring the ${preference} option.`
            };
            // Make the POST request to the comparison API
            const response = await fetch(COMPARE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            // Handle HTTP errors from the API response
            if (!response.ok) {
                let errorDetail = `HTTP error! Status: ${response.status}`;
                 try {
                     const errorData = await response.json(); // Try to get error details
                     errorDetail = errorData.detail || errorDetail;
                 } catch (jsonError) {
                     errorDetail = response.statusText || errorDetail; // Fallback to status text
                 }
                 throw new Error(errorDetail);
            }

            const data = await response.json();
            // Validate the response format (expecting an array of results)
            if (Array.isArray(data)) {
                setComparisonResults(data); // Update state with the comparison results
            } else {
                console.error("Invalid comparison data received:", data);
                throw new Error("Invalid comparison data received from server.");
            }

        } catch (err) {
            console.error("API Call failed:", err);
            setError(err.message || 'Failed to fetch comparison data. Please try again.'); // Set user-friendly error message
            setComparisonResults([]); // Clear potentially outdated results
        } finally {
            setIsLoading(false); // End loading state
        }
    };

    // Handler for clicking the "Select this Option" button on a result card
    const handleChooseOption = async (chosenOption) => {
        setIsSaving(true); // Indicate saving process start
        setError(null);
        setSaveSuccessMessage(''); // Reset messages

        try {
             // Prepare the data payload based on the chosen option
            const choiceData = {
                start_location: startLocation,
                end_location: endLocation,
                preference: preference,
                mode: chosenOption.mode, // Use 'mode' as expected by the backend
                distance_km: chosenOption.distance_km,
                time_minutes: chosenOption.time_minutes,
                co2_emission_g: chosenOption.co2_emission_g,
                estimated_cost: chosenOption.estimated_cost,
                co2_saved_g: chosenOption.co2_saved_g,
                booking_link: chosenOption.booking_link
            };

            // Make the POST request to the save choice API
            const response = await fetch(SAVE_CHOICE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(choiceData)
            });

            // Handle HTTP errors
            if (!response.ok) {
                let errorDetail = `HTTP error! Status: ${response.status}`;
                 try {
                     const errorData = await response.json();
                     errorDetail = errorData.detail || errorDetail;
                 } catch (jsonError) {
                     errorDetail = response.statusText || errorDetail;
                 }
                 throw new Error(errorDetail);
            }

            const result = await response.json();
            setSaveSuccessMessage(result.message || 'Choice saved successfully!'); // Display success message from backend

        } catch (err) {
            console.error("Save choice failed:", err);
            setError(err.message || 'Failed to save your choice. Please try again.'); // Display error message
        } finally {
            setIsSaving(false); // End saving state
        }
    };

    // --- Helper Function to Render Option Details ---
    // Takes a comparison result option and returns JSX for its details
    const renderOptionDetails = (option) => (
        <ul className="text-sm space-y-2 text-gray-700">
            {/* Display Distance */}
            <li className="flex items-center"><strong className="w-24 inline-block">Distance:</strong> {option.distance_km ?? 'N/A'} km</li>
            {/* Display Time */}
            <li className="flex items-center"><Clock className="mr-2 h-4 w-4 text-gray-500" /><strong className="w-20 inline-block">Time:</strong> {option.time_minutes ?? 'N/A'} min</li>
            {/* Display CO2 Emitted */}
            <li className="flex items-center"><CloudOff className="mr-2 h-4 w-4 text-gray-500" /><strong className="w-20 inline-block">CO₂ Emitted:</strong> {option.co2_emission_g ?? 'N/A'} g</li>
            {/* Display Estimated Cost */}
            <li className="flex items-center"><Wallet className="mr-2 h-4 w-4 text-gray-500" /><strong className="w-20 inline-block">Est. Cost:</strong> {option.estimated_cost || 'N/A'}</li>
            {/* Display CO2 Saved */}
            <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /><strong className="w-20 inline-block">CO₂ Saved:</strong> {option.co2_saved_g ?? 'N/A'} g</li>
            {/* Display Booking Link (if available and looks like a URL) */}
            <li className="flex items-center">
                 <strong className="w-24 inline-block">Booking:</strong>
                 {/* Render as a link only if it's a valid URL-like string */}
                 {option.booking_link && option.booking_link !== 'N/A' && option.booking_link.startsWith('http') ? (
                    <a href={option.booking_link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline hover:text-indigo-800 transition duration-150 ease-in-out">
                        Check Link
                    </a>
                ) : (
                    // Otherwise, display the text or 'N/A'
                    <span className="text-gray-500">{option.booking_link || 'N/A'}</span>
                )}
            </li>
        </ul>
    );

    // --- JSX Rendering for the Main Component ---
    return (
        // Main container with gradient background and flex column layout
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-sans relative"> {/* Added relative positioning for chatbot */}
            {/* Header Section */}
            <header className="bg-white text-gray-800 p-4 shadow-md flex-shrink-0 border-b border-gray-200">
                <h1 className="text-xl font-bold text-indigo-700">Sustainable Travel Comparator</h1>
            </header>

            {/* Main Content Area (flex layout for side panel and results) */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden p-4 md:p-6 gap-6">

                {/* Configuration Panel (Left Side) */}
                <Card className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 border border-gray-200">
                    <CardHeader>
                         <CardTitle>Plan Your Trip</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                         {/* Start Location Input with Suggestions */}
                        <div className="relative" ref={startInputContainerRef}>
                            <Label htmlFor="start-location">From</Label>
                            <Input
                                id="start-location"
                                type="text"
                                value={startLocation}
                                onChange={(e) => handleLocationInputChange(e, 'start')}
                                placeholder="Enter starting point"
                                disabled={isLoading || isSaving}
                                autoComplete="off"
                                onFocus={() => setActiveInput('start')}
                            />
                            {/* Suggestions Dropdown for Start Location */}
                            {activeInput === 'start' && (startSuggestions.length > 0 || isFetchingSuggestions) && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                     {/* Show loading indicator while fetching */}
                                     {isFetchingSuggestions && <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>}
                                    {/* Map through suggestions and display them */}
                                    {!isFetchingSuggestions && startSuggestions.map((s, i) => (
                                        <div
                                            key={i}
                                            className="px-3 py-2 text-sm hover:bg-indigo-100 cursor-pointer truncate"
                                            onClick={() => handleSuggestionClick(s, 'start')}
                                        >
                                            {s.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* End Location Input with Suggestions */}
                        <div className="relative" ref={endInputContainerRef}>
                            <Label htmlFor="end-location">To</Label>
                            <Input
                                id="end-location"
                                type="text"
                                value={endLocation}
                                onChange={(e) => handleLocationInputChange(e, 'end')}
                                placeholder="Enter destination"
                                disabled={isLoading || isSaving}
                                autoComplete="off"
                                onFocus={() => setActiveInput('end')}
                            />
                            {/* Suggestions Dropdown for End Location */}
                             {activeInput === 'end' && (endSuggestions.length > 0 || isFetchingSuggestions) && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                     {isFetchingSuggestions && <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>}
                                     {!isFetchingSuggestions && endSuggestions.map((s, i) => (
                                        <div
                                            key={i}
                                            className="px-3 py-2 text-sm hover:bg-indigo-100 cursor-pointer truncate"
                                            onClick={() => handleSuggestionClick(s, 'end')}
                                        >
                                            {s.name}
                                        </div>
                                     ))}
                                 </div>
                             )}
                        </div>

                        {/* Preference Selection Dropdown */}
                        {/* <div>
                            <Label htmlFor="preference">Prioritize</Label>
                            <Select
                                id="preference"
                                value={preference}
                                onChange={(e) => setPreference(e.target.value)}
                                disabled={isLoading || isSaving}
                            >
                                <option value="greenest">Lowest CO₂ (Greenest)</option>
                                <option value="fastest">Shortest Time (Fastest)</option>
                                <option value="cheapest">Lowest Cost (Cheapest)</option>
                                <option value="balanced">Balanced</option>
                            </Select>
                        </div> */}

                        {/* Action Button: Compare Options */}
                        <Button
                            onClick={handleCompareOptions}
                            disabled={isLoading || isSaving || !startLocation || !endLocation}
                            className="w-full mt-2"
                        >
                            {isLoading ? 'Comparing...' : 'Compare Options'}
                        </Button>

                        {/* Area for Error/Success Messages */}
                        <div className="h-6 mt-2 text-center">
                            {error && <p className="text-red-600 text-sm animate-pulse">{error}</p>}
                            {saveSuccessMessage && <p className="text-green-600 text-sm">{saveSuccessMessage}</p>}
                        </div>
                    </CardContent>
                 </Card>

                {/* Comparison Results Panel (Right Side/Main Area) */}
                <div className="flex-1 overflow-y-auto pb-4">
                     <h2 className="text-xl font-semibold text-gray-800 mb-4">Travel Options</h2>
                     {/* Loading Spinner (visible during comparison API call) */}
                     {isLoading && (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                     )}
                     {/* Initial/Empty State Message */}
                     {!isLoading && comparisonResults.length === 0 && !error && (
                         <div className="text-center text-gray-500 p-10 bg-white rounded-lg shadow">
                             Enter locations and click compare to see travel options.
                         </div>
                     )}
                    {/* Results Grid (visible when results are available) */}
                    {!isLoading && comparisonResults.length > 0 && (
                         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                             {/* Map through comparison results and render a card for each option */}
                             {comparisonResults.map((option, index) => {
                                // Get the appropriate icon based on the travel mode
                                const IconComponent = modeIcons[option.mode] || modeIcons.Default;
                                return (
                                    <Card key={index} className={`transition duration-300 ease-in-out hover:shadow-xl ${
                                        // Add border/ring styling if the option is recommended
                                        option.is_recommended ? 'border-2 border-green-500 ring-2 ring-green-200' : 'border border-gray-200'
                                    }`}>
                                        <CardHeader className="flex justify-between items-center bg-gray-50">
                                            <CardTitle Icon={IconComponent}>{option.mode}</CardTitle>
                                            {/* Recommended Badge */}
                                            {option.is_recommended && (
                                                <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
                                                    <Star className="mr-1 h-3 w-3" /> Recommended
                                                </span>
                                            )}
                                        </CardHeader>
                                        <CardContent>
                                             {/* Render the details for this option */}
                                             {renderOptionDetails(option)}
                                        </CardContent>
                                        {/* Action Button: Select this Option */}
                                        <div className="p-4 border-t border-gray-100 mt-auto">
                                            <Button
                                                onClick={() => handleChooseOption(option)}
                                                disabled={isSaving}
                                                className="w-full text-sm bg-indigo-500 hover:bg-indigo-600"
                                                Icon={CheckCircle}
                                            >
                                                {isSaving ? 'Saving...' : 'Select this Option'}
                                            </Button>
                                        </div>
                                     </Card>
                                );
                             })}
                         </div>
                     )}
                 </div>
            </div>

            {/* --- Chatbot Integration --- */}
            {/* Render the Chatbot component (it handles its own positioning) */}
            <Chatbot />
        </div>
    );
}

// Export the main component
export default LandingComponent;