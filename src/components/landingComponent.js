



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



















// import React, { useState, useEffect, useRef, useCallback } from 'react';
// // Import icons from lucide-react
// import { Bike, Bus, Car, Plane, TramFront, Train, Walk, Wallet, Clock, CloudOff, CheckCircle, Star, Footprints, MessageSquare, X, Send, Loader2 } from 'lucide-react';

// // --- Reusable Components (Keep as before) ---
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

// // --- Icon Mapping (Keep as before) ---
// const modeIcons = { /* ... keep mapping ... */
//     "Walking": Footprints, "Cycling": Bike, "Bus": Bus, "Metro": TramFront, "Train": Train,
//     "Taxi/Rideshare": Car, "Private Car": Car, "Flight": Plane, "Default": Star
// };

// //for navigaton page


// // --- UPDATED Chatbot Component ---
// // Now receives context props from the parent (LandingComponent)
// const Chatbot = ({ startLocation, endLocation, preference, comparisonResults }) => {
//     const [isOpen, setIsOpen] = useState(false);
//     // Messages now only need sender and text
//     const [messages, setMessages] = useState([]); // Array of { sender: 'bot' | 'user', text: string }
//     const [inputValue, setInputValue] = useState('');
//     const [isLoading, setIsLoading] = useState(false); // Loading state for chatbot response
//     const messagesEndRef = useRef(null);
//     const CHATBOT_API_URL = 'http://127.0.0.1:8000/chatbot';

//     // Scroll to bottom effect (Keep as before)
//     const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
//     useEffect(scrollToBottom, [messages]);

//     // Effect to add initial message when opened *and* comparison results are available
//     useEffect(() => {
//         if (isOpen && messages.length === 0 && comparisonResults && comparisonResults.length > 0) {
//             setMessages([{
//                 sender: 'bot',
//                 text: "I see you have some travel options. Ask me anything about them or tell me if you'd like a different suggestion!"
//             }]);
//         } else if (isOpen && messages.length === 0) {
//              setMessages([{
//                 sender: 'bot',
//                 text: "Hello! Please generate travel options using the main panel first, then I can help you discuss them."
//             }]);
//         }
//         // Clear messages when closing if desired (optional)
//         // if (!isOpen) { setMessages([]); }
//     }, [isOpen, comparisonResults]); // Re-evaluate initial message if results change while open

//     // Renamed function to send message and context to backend
//     const sendMessageToServer = async (userMessage) => {
//         // Prevent sending if no comparison results are loaded
//         if (!comparisonResults || comparisonResults.length === 0) {
//              setMessages(prev => [...prev, { sender: 'bot', text: "Please generate travel options first before asking questions." }]);
//              return;
//         }

//         setIsLoading(true);
//         try {
//             const requestBody = {
//                 user_message: userMessage,
//                 start_location: startLocation,
//                 end_location: endLocation,
//                 preference: preference,
//                 comparison_results: comparisonResults // Send the full results list
//             };

//             const response = await fetch(CHATBOT_API_URL, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
//                 body: JSON.stringify(requestBody)
//             });

//             if (!response.ok) { /* ... error handling ... */
//                 let errorDetail = `HTTP error! Status: ${response.status}`;
//                 try { const errorData = await response.json(); errorDetail = errorData.detail || errorDetail; } catch (e) {}
//                 throw new Error(errorDetail);
//              }

//             const data = await response.json(); // Expects { message: string }

//             // Add bot's response message to the chat state
//             const botMessage = { sender: 'bot', text: data.message };
//             setMessages(prev => [...prev, botMessage]);

//         } catch (error) {
//             console.error("Chatbot API error:", error);
//             setMessages(prev => [...prev, { sender: 'bot', text: `Sorry, I couldn't process that. Error: ${error.message}` }]);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Handler for sending a message (Keep core logic, call renamed function)
//     const handleSendMessage = (e) => {
//         e.preventDefault();
//         const trimmedInput = inputValue.trim();
//         // Also disable if comparison results aren't available
//         if (!trimmedInput || isLoading || !comparisonResults || comparisonResults.length === 0) return;

//         setMessages(prev => [...prev, { sender: 'user', text: trimmedInput }]);
//         setInputValue('');

//         // Call the updated function to send message and context
//         sendMessageToServer(trimmedInput);
//     };

//     // Determine if chatbot should be interactive
//     const canInteract = comparisonResults && comparisonResults.length > 0;

//     // JSX for the Chatbot UI (Mostly styling, update placeholder text)
//     return (
//         <>
//             {/* Chat Bubble Toggle Button */}
//             {!isOpen && ( <button onClick={() => setIsOpen(true)} className="fixed bottom-5 right-5 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 z-40" aria-label="Open Chat"> <MessageSquare size={24} /> </button> )}

//             {/* Chat Window */}
//             {isOpen && (
//                 <div className="fixed bottom-5 right-5 w-80 h-[450px] bg-white rounded-lg shadow-xl flex flex-col border border-gray-300 z-50">
//                     {/* Chat Header */}
//                     <div className="flex justify-between items-center p-3 bg-indigo-600 text-white rounded-t-lg">
//                         <h3 className="font-semibold text-sm">Travel Assistant</h3> {/* Changed Title */}
//                         <button onClick={() => setIsOpen(false)} className="text-indigo-100 hover:text-white focus:outline-none" aria-label="Close Chat"> <X size={20} /> </button>
//                     </div>

//                     {/* Messages Area */}
//                     <div className="flex-grow p-3 overflow-y-auto space-y-3 text-sm">
//                         {messages.map((msg, index) => (
//                             <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
//                                 <div className={`max-w-[80%] p-2 rounded-lg shadow-sm ${ msg.sender === 'user' ? 'bg-blue-100 text-gray-800' : 'bg-gray-100 text-gray-800' }`}>
//                                     {/* Simple text display */}
//                                     <p>{msg.text}</p>
//                                 </div>
//                             </div>
//                         ))}
//                         {isLoading && ( /* Loading Indicator */ <div className="flex justify-start"> <div className="bg-gray-200 text-gray-800 p-2 rounded-lg inline-flex items-center space-x-2"> <Loader2 size={16} className="animate-spin" /> <span>Thinking...</span> </div> </div> )}
//                          <div ref={messagesEndRef} />
//                     </div>

//                     {/* Chat Input Area */}
//                     <div className="p-3 border-t border-gray-200">
//                         <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
//                             <Input
//                                 type="text"
//                                 value={inputValue}
//                                 onChange={(e) => setInputValue(e.target.value)}
//                                 // Update placeholder based on whether comparison results are ready
//                                 placeholder={canInteract ? "Ask about options..." : "Generate options first..."}
//                                 className="flex-grow text-sm"
//                                 // Disable input if loading OR if interaction is not possible
//                                 disabled={isLoading || !canInteract}
//                                 autoComplete="off"
//                             />
//                             <Button
//                                 type="submit"
//                                 className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
//                                 // Disable button if loading, input empty, or interaction not possible
//                                 disabled={isLoading || !inputValue.trim() || !canInteract}
//                                 aria-label="Send Message"
//                             >
//                                 <Send size={18} />
//                             </Button>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// };


// // --- UPDATED Main Landing Page Component ---
// // Renamed to App for standard React practice, added prop passing to Chatbot
// function App() {
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
//      useEffect(() => { /* ... click outside handler ... */
//         const handleClickOutside = (event) => {
//              if ( startInputContainerRef.current && !startInputContainerRef.current.contains(event.target) && endInputContainerRef.current && !endInputContainerRef.current.contains(event.target) ) {
//                  setActiveInput(null); setStartSuggestions([]); setEndSuggestions([]);
//              }
//          };
//          document.addEventListener('mousedown', handleClickOutside);
//          return () => document.removeEventListener('mousedown', handleClickOutside);
//      }, []);

//     // --- Location Suggestion Logic (Keep as before) ---
//      const fetchLocationSuggestions = useCallback(async (query, type) => { /* ... */
//          if (!query || query.length < 3) { type === 'start' ? setStartSuggestions([]) : setEndSuggestions([]); return; }
//          setIsFetchingSuggestions(true);
//          try {
//              const response = await fetch( `${LOCATION_API_URL}?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in` );
//              if (!response.ok) throw new Error('Failed to fetch suggestions');
//              const data = await response.json();
//              const suggestions = data.map(item => ({ name: item.display_name })).filter((s, i, arr) => arr.findIndex(t => t.name === s.name) === i);
//              if (type === 'start') setStartSuggestions(suggestions); else setEndSuggestions(suggestions);
//          } catch (err) { console.error("Suggestion fetch error:", err); setStartSuggestions([]); setEndSuggestions([]); }
//          finally { setIsFetchingSuggestions(false); }
//      }, []); // LOCATION_API_URL is constant

//     const handleLocationInputChange = (e, type) => { /* ... */
//         const value = e.target.value; setActiveInput(type);
//         if (type === 'start') setStartLocation(value); else setEndLocation(value);
//         if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
//         debounceTimeoutRef.current = setTimeout(() => { fetchLocationSuggestions(value, type); }, 500);
//      };

//      const handleSuggestionClick = (suggestion, type) => { /* ... */
//         if (type === 'start') { setStartLocation(suggestion.name); setStartSuggestions([]); }
//         else { setEndLocation(suggestion.name); setEndSuggestions([]); }
//         setActiveInput(null);
//       };

//     // --- Event Handlers for Comparison and Saving (Keep as before) ---
//     const handleCompareOptions = async (e) => { /* ... */
//         e.preventDefault();
//         if (!startLocation || !endLocation) { setError('Please enter both Start and End locations.'); return; }
//         setIsLoading(true); setError(null); setComparisonResults([]); setSaveSuccessMessage('');
//         try {
//             const requestBody = { start_location: startLocation, end_location: endLocation, preference: preference, user_message: `Compare options from ${startLocation} to ${endLocation} preferring ${preference}` };
//             const response = await fetch(COMPARE_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(requestBody) });
//             if (!response.ok) { let eD = `HTTP error! Status: ${response.status}`; try { const eData=await response.json(); eD=eData.detail||eD; } catch(jE){} throw new Error(eD); }
//             const data = await response.json();
//             if (Array.isArray(data)) { setComparisonResults(data); } else { throw new Error("Invalid comparison data received."); }
//         } catch (err) { console.error("API Call failed:", err); setError(err.message || 'Failed to fetch comparison.'); setComparisonResults([]); }
//         finally { setIsLoading(false); }
//      };

//     const handleChooseOption = async (chosenOption) => { /* ... */
//         setIsSaving(true); setError(null); setSaveSuccessMessage('');
//         try {
//             const choiceData = { start_location: startLocation, end_location: endLocation, preference: preference, mode: chosenOption.mode, distance_km: chosenOption.distance_km, time_minutes: chosenOption.time_minutes, co2_emission_g: chosenOption.co2_emission_g, estimated_cost: chosenOption.estimated_cost, co2_saved_g: chosenOption.co2_saved_g, booking_link: chosenOption.booking_link };
//             const response = await fetch(SAVE_CHOICE_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(choiceData) });
//              if (!response.ok) { let eD = `HTTP error! Status: ${response.status}`; try { const eData=await response.json(); eD=eData.detail||eD; } catch(jE){} throw new Error(eD); }
//             const result = await response.json();
//             setSaveSuccessMessage(result.message || 'Choice saved successfully!');
//         } catch (err) { console.error("Save choice failed:", err); setError(err.message || 'Failed to save choice.'); }
//         finally { setIsSaving(false); }
//      };

//     // --- Helper Function to Render Option Details (Keep as before) ---
//     const renderOptionDetails = (option) => ( /* ... */
//         <ul className="text-sm space-y-2 text-gray-700">
//             <li className="flex items-center"><strong className="w-24 inline-block">Distance:</strong> {option.distance_km ?? 'N/A'} km</li>
//             <li className="flex items-center"><Clock className="mr-2 h-4 w-4 text-gray-500" /><strong className="w-20 inline-block">Time:</strong> {option.time_minutes ?? 'N/A'} min</li>
//             <li className="flex items-center"><CloudOff className="mr-2 h-4 w-4 text-gray-500" /><strong className="w-20 inline-block">CO₂ Emitted:</strong> {option.co2_emission_g ?? 'N/A'} g</li>
//             <li className="flex items-center"><Wallet className="mr-2 h-4 w-4 text-gray-500" /><strong className="w-20 inline-block">Est. Cost:</strong> {option.estimated_cost || 'N/A'}</li>
//             <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /><strong className="w-20 inline-block">CO₂ Saved:</strong> {option.co2_saved_g ?? 'N/A'} g</li>
//             <li className="flex items-center">
//                  <strong className="w-24 inline-block">Booking:</strong>
//                  {option.booking_link && option.booking_link !== 'N/A' && option.booking_link.startsWith('http') ? ( <a href={option.booking_link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline hover:text-indigo-800 transition duration-150 ease-in-out"> Check Link </a> ) : ( <span className="text-gray-500">{option.booking_link || 'N/A'}</span> )}
//             </li>
//         </ul>
//      );

//     // --- JSX Rendering for the Main Component ---
//     return (
//         <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-sans relative">
//             {/* Header */}
//             <header className="bg-white text-gray-800 p-4 shadow-md flex-shrink-0 border-b border-gray-200"> <h1 className="text-xl font-bold text-indigo-700">Sustainable Travel Comparator</h1> </header>

//             {/* Main Content Area */}
//             <div className="flex flex-col md:flex-row flex-1 overflow-hidden p-4 md:p-6 gap-6">

//                 {/* Configuration Panel */}
//                 <Card className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 border border-gray-200">
//                     <CardHeader> <CardTitle>Plan Your Trip</CardTitle> </CardHeader>
//                     <CardContent className="space-y-5">
//                          {/* Start Location */}
//                         <div className="relative" ref={startInputContainerRef}>
//                             <Label htmlFor="start-location">From</Label>
//                             <Input id="start-location" type="text" value={startLocation} onChange={(e) => handleLocationInputChange(e, 'start')} placeholder="Enter starting point" disabled={isLoading || isSaving} autoComplete="off" onFocus={() => setActiveInput('start')} />
//                             {activeInput === 'start' && (startSuggestions.length > 0 || isFetchingSuggestions) && ( <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"> {isFetchingSuggestions && <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>} {!isFetchingSuggestions && startSuggestions.map((s, i) => <div key={i} className="px-3 py-2 text-sm hover:bg-indigo-100 cursor-pointer truncate" onClick={() => handleSuggestionClick(s, 'start')}>{s.name}</div>)} </div> )}
//                         </div>
//                         {/* End Location */}
//                          <div className="relative" ref={endInputContainerRef}>
//                             <Label htmlFor="end-location">To</Label>
//                             <Input id="end-location" type="text" value={endLocation} onChange={(e) => handleLocationInputChange(e, 'end')} placeholder="Enter destination" disabled={isLoading || isSaving} autoComplete="off" onFocus={() => setActiveInput('end')} />
//                              {activeInput === 'end' && (endSuggestions.length > 0 || isFetchingSuggestions) && ( <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"> {isFetchingSuggestions && <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>} {!isFetchingSuggestions && endSuggestions.map((s, i) => <div key={i} className="px-3 py-2 text-sm hover:bg-indigo-100 cursor-pointer truncate" onClick={() => handleSuggestionClick(s, 'end')}>{s.name}</div>)} </div> )}
//                         </div>
//                         {/* Preference */}
//                         <div>
//                             <Label htmlFor="preference">Prioritize</Label>
//                             <Select id="preference" value={preference} onChange={(e) => setPreference(e.target.value)} disabled={isLoading || isSaving}> <option value="greenest">Lowest CO₂ (Greenest)</option> <option value="fastest">Shortest Time (Fastest)</option> <option value="cheapest">Lowest Cost (Cheapest)</option> <option value="balanced">Balanced</option> </Select>
//                         </div>
//                         {/* Action Button */}
//                         <Button onClick={handleCompareOptions} disabled={isLoading || isSaving || !startLocation || !endLocation} className="w-full mt-2"> {isLoading ? 'Comparing...' : 'Compare Options'} </Button>
//                         {/* Messages */}
//                         <div className="h-6 mt-2 text-center"> {error && <p className="text-red-600 text-sm animate-pulse">{error}</p>} {saveSuccessMessage && <p className="text-green-600 text-sm">{saveSuccessMessage}</p>} </div>
//                     </CardContent>
//                  </Card>

//                 {/* Comparison Results Panel */}
//                 <div className="flex-1 overflow-y-auto pb-4">
//                      <h2 className="text-xl font-semibold text-gray-800 mb-4">Travel Options</h2>
//                      {isLoading && ( <div className="flex justify-center items-center h-40"> <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div> </div> )}
//                      {!isLoading && comparisonResults.length === 0 && !error && ( <div className="text-center text-gray-500 p-10 bg-white rounded-lg shadow"> Enter locations and click compare to see travel options. </div> )}
//                     {!isLoading && comparisonResults.length > 0 && (
//                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
//                              {comparisonResults.map((option, index) => {
//                                 const IconComponent = modeIcons[option.mode] || modeIcons.Default;
//                                 return (
//                                     <Card key={index} className={`transition duration-300 ease-in-out hover:shadow-xl ${ option.is_recommended ? 'border-2 border-green-500 ring-2 ring-green-200' : 'border border-gray-200'}`}>
//                                         <CardHeader className="flex justify-between items-center bg-gray-50"> <CardTitle Icon={IconComponent}>{option.mode}</CardTitle> {option.is_recommended && ( <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center"> <Star className="mr-1 h-3 w-3" /> Recommended </span> )} </CardHeader>
//                                         <CardContent> {renderOptionDetails(option)} </CardContent>
//                                         <div className="p-4 border-t border-gray-100 mt-auto"> <Button onClick={() => handleChooseOption(option)} disabled={isSaving} className="w-full text-sm bg-indigo-500 hover:bg-indigo-600" Icon={CheckCircle}> {isSaving ? 'Saving...' : 'Select this Option'} </Button> </div>
//                                      </Card>
//                                 );
//                              })}
//                          </div>
//                      )}
//                  </div>
//             </div>

//             {/* --- Chatbot Integration --- */}
//             {/* Pass the necessary context as props to the Chatbot */}
//             <Chatbot
//                 startLocation={startLocation}
//                 endLocation={endLocation}
//                 preference={preference}
//                 comparisonResults={comparisonResults}
//             />
//         </div>
//     );
// }

// export default App; // Export the main App component



















































































import React, { useState, useEffect, useRef, useCallback } from 'react';
// Import icons from lucide-react
import { Bike, Bus, Car, Plane, TramFront, Train, Walk, Wallet, Clock, CloudOff, CheckCircle, Star, Footprints, MessageSquare, X, Send, Loader2 } from 'lucide-react';

// --- Reusable Components ---
const Label = ({ children, ...props }) => <label className="block text-sm font-medium text-gray-700 mb-1" {...props}>{children}</label>;
const Input = React.forwardRef((props, ref) => <input ref={ref} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400" {...props} />);
const Button = ({ children, className = '', Icon = null, ...props }) => (
    <button
        className={`inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out ${className}`}
        {...props}
    >
        {Icon && <Icon className="mr-2 h-4 w-4" />}
        {children}
    </button>
);
const Select = ({ children, ...props }) => <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white" {...props}>{children}</select>;
const Card = ({ children, className = '', ...props }) => <div className={`bg-white shadow-lg rounded-lg overflow-hidden flex flex-col ${className}`} {...props}>{children}</div>;
const CardHeader = ({ children, className = '', ...props }) => <div className={`p-4 border-b border-gray-200 ${className}`} {...props}>{children}</div>;
const CardTitle = ({ children, className = '', Icon = null, ...props }) => (
    <h3 className={`text-lg leading-6 font-semibold text-gray-900 flex items-center ${className}`} {...props}>
        {Icon && <Icon className="mr-2 h-5 w-5 text-indigo-600" />}
        {children}
    </h3>
);
const CardContent = ({ children, className = '', ...props }) => <div className={`p-4 flex-grow ${className}`} {...props}>{children}</div>;

// --- Icon Mapping ---
const modeIcons = {
    "Walking": Footprints, "Cycling": Bike, "Bus": Bus, "Metro": TramFront, "Train": Train,
    "Taxi/Rideshare": Car, "Private Car": Car, "Flight": Plane, "Default": Star
};

// --- Chatbot Component (Keep as before) ---
// Now receives context props from the parent (LandingComponent)
const Chatbot = ({ startLocation, endLocation, preference, comparisonResults }) => {
    const [isOpen, setIsOpen] = useState(false);
    // Messages now only need sender and text
    const [messages, setMessages] = useState([]); // Array of { sender: 'bot' | 'user', text: string }
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Loading state for chatbot response
    const messagesEndRef = useRef(null);
    const CHATBOT_API_URL = 'http://127.0.0.1:8000/chatbot'; // Replace with your actual API endpoint

    // Scroll to bottom effect
    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
    useEffect(scrollToBottom, [messages]);

    // Effect to add initial message when opened *and* comparison results are available
    useEffect(() => {
        if (isOpen && messages.length === 0 && comparisonResults && comparisonResults.length > 0) {
            setMessages([{
                sender: 'bot',
                text: "I see you have some travel options. Ask me anything about them or tell me if you'd like a different suggestion!"
            }]);
        } else if (isOpen && messages.length === 0) {
             setMessages([{
                sender: 'bot',
                text: "Hello! Please generate travel options using the main panel first, then I can help you discuss them."
            }]);
        }
    }, [isOpen, comparisonResults, messages.length]); // Added messages.length dependency

    // Renamed function to send message and context to backend
    const sendMessageToServer = async (userMessage) => {
        // Prevent sending if no comparison results are loaded
        if (!comparisonResults || comparisonResults.length === 0) {
             setMessages(prev => [...prev, { sender: 'bot', text: "Please generate travel options first before asking questions." }]);
             return;
        }

        setIsLoading(true);
        try {
            const requestBody = {
                user_message: userMessage,
                start_location: startLocation,
                end_location: endLocation,
                preference: preference,
                comparison_results: comparisonResults // Send the full results list
            };

            const response = await fetch(CHATBOT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                let errorDetail = `HTTP error! Status: ${response.status}`;
                try { const errorData = await response.json(); errorDetail = errorData.detail || errorDetail; } catch (e) {}
                throw new Error(errorDetail);
             }

            const data = await response.json(); // Expects { message: string }

            // Add bot's response message to the chat state
            const botMessage = { sender: 'bot', text: data.message };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Chatbot API error:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: `Sorry, I couldn't process that. Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handler for sending a message
    const handleSendMessage = (e) => {
        e.preventDefault();
        const trimmedInput = inputValue.trim();
        // Also disable if comparison results aren't available
        if (!trimmedInput || isLoading || !comparisonResults || comparisonResults.length === 0) return;

        setMessages(prev => [...prev, { sender: 'user', text: trimmedInput }]);
        setInputValue('');

        // Call the updated function to send message and context
        sendMessageToServer(trimmedInput);
    };

    // Determine if chatbot should be interactive
    const canInteract = comparisonResults && comparisonResults.length > 0;

    // JSX for the Chatbot UI
    return (
        <>
            {/* Chat Bubble Toggle Button */}
            {!isOpen && ( <button onClick={() => setIsOpen(true)} className="fixed bottom-5 right-5 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 z-40" aria-label="Open Chat"> <MessageSquare size={24} /> </button> )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-5 right-5 w-80 h-[450px] bg-white rounded-lg shadow-xl flex flex-col border border-gray-300 z-50">
                    {/* Chat Header */}
                    <div className="flex justify-between items-center p-3 bg-indigo-600 text-white rounded-t-lg">
                        <h3 className="font-semibold text-sm">Travel Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="text-indigo-100 hover:text-white focus:outline-none" aria-label="Close Chat"> <X size={20} /> </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-grow p-3 overflow-y-auto space-y-3 text-sm">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-2 rounded-lg shadow-sm ${ msg.sender === 'user' ? 'bg-blue-100 text-gray-800' : 'bg-gray-100 text-gray-800' }`}>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && ( <div className="flex justify-start"> <div className="bg-gray-200 text-gray-800 p-2 rounded-lg inline-flex items-center space-x-2"> <Loader2 size={16} className="animate-spin" /> <span>Thinking...</span> </div> </div> )}
                         <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input Area */}
                    <div className="p-3 border-t border-gray-200">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                            <Input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={canInteract ? "Ask about options..." : "Generate options first..."}
                                className="flex-grow text-sm"
                                disabled={isLoading || !canInteract}
                                autoComplete="off"
                            />
                            <Button
                                type="submit"
                                className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                                disabled={isLoading || !inputValue.trim() || !canInteract}
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
function App() {
    // --- State Variables ---
    const [startLocation, setStartLocation] = useState('');
    const [endLocation, setEndLocation] = useState('');
    const [preference, setPreference] = useState('greenest');
    const [comparisonResults, setComparisonResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

    // --- Location Suggestions State ---
    const [startSuggestions, setStartSuggestions] = useState([]);
    const [endSuggestions, setEndSuggestions] = useState([]);
    const [activeInput, setActiveInput] = useState(null);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    const debounceTimeoutRef = useRef(null);
    const startInputContainerRef = useRef(null);
    const endInputContainerRef = useRef(null);

    // API endpoint URLs
    const COMPARE_API_URL = 'http://127.0.0.1:8000/compare'; // Replace with your actual API endpoint
    const SAVE_CHOICE_API_URL = 'http://127.0.0.1:8000/save_choice'; // Replace with your actual API endpoint
    const LOCATION_API_URL = 'https://nominatim.openstreetmap.org/search'; // Using OpenStreetMap Nominatim

    // --- Effects ---
     useEffect(() => {
        // Click outside handler to close suggestion dropdowns
        const handleClickOutside = (event) => {
             if ( startInputContainerRef.current && !startInputContainerRef.current.contains(event.target) && endInputContainerRef.current && !endInputContainerRef.current.contains(event.target) ) {
                 setActiveInput(null); setStartSuggestions([]); setEndSuggestions([]);
             }
         };
         document.addEventListener('mousedown', handleClickOutside);
         return () => document.removeEventListener('mousedown', handleClickOutside);
     }, []);

    // --- Location Suggestion Logic ---
     const fetchLocationSuggestions = useCallback(async (query, type) => {
         if (!query || query.length < 3) { type === 'start' ? setStartSuggestions([]) : setEndSuggestions([]); return; }
         setIsFetchingSuggestions(true);
         try {
             // Added countrycodes=in to prioritize results in India
             const response = await fetch( `${LOCATION_API_URL}?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in` );
             if (!response.ok) throw new Error('Failed to fetch suggestions');
             const data = await response.json();
             // Filter unique display names
             const suggestions = data.map(item => ({ name: item.display_name })).filter((s, i, arr) => arr.findIndex(t => t.name === s.name) === i);
             if (type === 'start') setStartSuggestions(suggestions); else setEndSuggestions(suggestions);
         } catch (err) { console.error("Suggestion fetch error:", err); setStartSuggestions([]); setEndSuggestions([]); }
         finally { setIsFetchingSuggestions(false); }
     }, []); // LOCATION_API_URL is constant

    const handleLocationInputChange = (e, type) => {
        const value = e.target.value; setActiveInput(type);
        if (type === 'start') setStartLocation(value); else setEndLocation(value);
        // Debounce the API call
        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = setTimeout(() => { fetchLocationSuggestions(value, type); }, 500); // 500ms delay
     };

     const handleSuggestionClick = (suggestion, type) => {
        if (type === 'start') { setStartLocation(suggestion.name); setStartSuggestions([]); }
        else { setEndLocation(suggestion.name); setEndSuggestions([]); }
        setActiveInput(null); // Close dropdown after selection
      };

    // --- Event Handlers for Comparison ---
    const handleCompareOptions = async (e) => {
        e.preventDefault();
        if (!startLocation || !endLocation) { setError('Please enter both Start and End locations.'); return; }
        setIsLoading(true); setError(null); setComparisonResults([]); setSaveSuccessMessage('');
        try {
            const requestBody = { start_location: startLocation, end_location: endLocation, preference: preference, user_message: `Compare options from ${startLocation} to ${endLocation} preferring ${preference}` };
            const response = await fetch(COMPARE_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(requestBody) });
            if (!response.ok) { let eD = `HTTP error! Status: ${response.status}`; try { const eData=await response.json(); eD=eData.detail||eD; } catch(jE){} throw new Error(eD); }
            const data = await response.json();
            if (Array.isArray(data)) { setComparisonResults(data); } else { throw new Error("Invalid comparison data received."); }
        } catch (err) { console.error("API Call failed:", err); setError(err.message || 'Failed to fetch comparison.'); setComparisonResults([]); }
        finally { setIsLoading(false); }
     };

    // --- MODIFIED Event Handler for Saving Choice & Triggering Navigation ---
    const handleChooseOption = async (chosenOption) => {
        setIsSaving(true); setError(null); setSaveSuccessMessage('');

        // --- Navigation Trigger Logic ---
        const navigationModes = ['Walking', 'Cycling', 'Car', 'Bike', 'Bus', 'Private Car', 'Taxi/Rideshare']; // Modes that trigger navigation
        const googleMapsModes = { // Mapping to Google Maps travelmode parameter
            'Walking': 'walking',
            'Cycling': 'bicycling',
            'Bus': 'transit', // Use transit for Bus
            'Car': 'driving',
            'Private Car': 'driving',
            'Taxi/Rideshare': 'driving',
            'Bike': 'driving' // Assuming 'Bike' means motorcycle, use 'driving'
            // Add other modes if needed, e.g., 'Train': 'transit'
        };

        if (navigationModes.includes(chosenOption.mode) && startLocation && endLocation) {
            const travelModeParam = googleMapsModes[chosenOption.mode] || 'driving'; // Default to driving if not mapped
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startLocation)}&destination=${encodeURIComponent(endLocation)}&travelmode=${travelModeParam}`;
            console.log("Opening navigation:", mapsUrl); // Log for debugging
            window.open(mapsUrl, '_blank', 'noopener,noreferrer'); // Open in new tab
        }
        // --- End Navigation Trigger Logic ---

        // --- Save Choice Logic (runs regardless of navigation) ---
        try {
            const choiceData = {
                start_location: startLocation,
                end_location: endLocation,
                preference: preference,
                mode: chosenOption.mode,
                distance_km: chosenOption.distance_km,
                time_minutes: chosenOption.time_minutes,
                co2_emission_g: chosenOption.co2_emission_g,
                estimated_cost: chosenOption.estimated_cost,
                co2_saved_g: chosenOption.co2_saved_g,
                booking_link: chosenOption.booking_link
            };
            const response = await fetch(SAVE_CHOICE_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(choiceData) });
             if (!response.ok) { let eD = `HTTP error! Status: ${response.status}`; try { const eData=await response.json(); eD=eData.detail||eD; } catch(jE){} throw new Error(eD); }
            const result = await response.json();
            setSaveSuccessMessage(result.message || 'Choice saved successfully!');
            // Optionally clear results or perform other actions after saving
            // setComparisonResults([]);
        } catch (err) {
            console.error("Save choice failed:", err);
            setError(err.message || 'Failed to save choice.');
            // Don't clear the success message if saving fails after navigation attempt
            // setSaveSuccessMessage('');
        } finally {
            setIsSaving(false); // Set saving state to false after API call finishes
        }
     };

    // --- Helper Function to Render Option Details ---
    const renderOptionDetails = (option) => (
        <ul className="text-sm space-y-2 text-gray-700">
            <li className="flex items-center"><strong className="w-24 inline-block">Distance:</strong> {option.distance_km ?? 'N/A'} km</li>
            <li className="flex items-center"><Clock className="mr-2 h-4 w-4 text-gray-500" /><strong className="w-20 inline-block">Time:</strong> {option.time_minutes ?? 'N/A'} min</li>
            <li className="flex items-center"><CloudOff className="mr-2 h-4 w-4 text-gray-500" /><strong className="w-20 inline-block">CO₂ Emitted:</strong> {option.co2_emission_g ?? 'N/A'} g</li>
            <li className="flex items-center"><Wallet className="mr-2 h-4 w-4 text-gray-500" /><strong className="w-20 inline-block">Est. Cost:</strong> {option.estimated_cost || 'N/A'}</li>
            <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /><strong className="w-20 inline-block">CO₂ Saved:</strong> {option.co2_saved_g ?? 'N/A'} g</li>
            <li className="flex items-center">
                 <strong className="w-24 inline-block">Booking:</strong>
                 {option.booking_link && option.booking_link !== 'N/A' && option.booking_link.startsWith('http') ? ( <a href={option.booking_link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline hover:text-indigo-800 transition duration-150 ease-in-out"> Check Link </a> ) : ( <span className="text-gray-500">{option.booking_link || 'N/A'}</span> )}
            </li>
        </ul>
     );

    // --- JSX Rendering for the Main Component ---
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-sans relative">
            {/* Header */}
            <header className="bg-white text-gray-800 p-4 shadow-md flex-shrink-0 border-b border-gray-200"> <h1 className="text-xl font-bold text-indigo-700">Sustainable Travel Comparator</h1> </header>

            {/* Main Content Area */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden p-4 md:p-6 gap-6">

                {/* Configuration Panel */}
                <Card className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 border border-gray-200">
                    <CardHeader> <CardTitle>Plan Your Trip</CardTitle> </CardHeader>
                    <CardContent className="space-y-5">
                         {/* Start Location */}
                        <div className="relative" ref={startInputContainerRef}>
                            <Label htmlFor="start-location">From</Label>
                            <Input id="start-location" type="text" value={startLocation} onChange={(e) => handleLocationInputChange(e, 'start')} placeholder="Enter starting point" disabled={isLoading || isSaving} autoComplete="off" onFocus={() => setActiveInput('start')} />
                            {/* Suggestions Dropdown */}
                            {activeInput === 'start' && (startSuggestions.length > 0 || isFetchingSuggestions) && ( <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"> {isFetchingSuggestions && <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>} {!isFetchingSuggestions && startSuggestions.map((s, i) => <div key={i} className="px-3 py-2 text-sm hover:bg-indigo-100 cursor-pointer truncate" onClick={() => handleSuggestionClick(s, 'start')}>{s.name}</div>)} </div> )}
                        </div>
                        {/* End Location */}
                         <div className="relative" ref={endInputContainerRef}>
                            <Label htmlFor="end-location">To</Label>
                            <Input id="end-location" type="text" value={endLocation} onChange={(e) => handleLocationInputChange(e, 'end')} placeholder="Enter destination" disabled={isLoading || isSaving} autoComplete="off" onFocus={() => setActiveInput('end')} />
                             {/* Suggestions Dropdown */}
                             {activeInput === 'end' && (endSuggestions.length > 0 || isFetchingSuggestions) && ( <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"> {isFetchingSuggestions && <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>} {!isFetchingSuggestions && endSuggestions.map((s, i) => <div key={i} className="px-3 py-2 text-sm hover:bg-indigo-100 cursor-pointer truncate" onClick={() => handleSuggestionClick(s, 'end')}>{s.name}</div>)} </div> )}
                        </div>
                        {/* Preference */}
                        <div>
                            <Label htmlFor="preference">Prioritize</Label>
                            <Select id="preference" value={preference} onChange={(e) => setPreference(e.target.value)} disabled={isLoading || isSaving}> <option value="greenest">Lowest CO₂ (Greenest)</option> <option value="fastest">Shortest Time (Fastest)</option> <option value="cheapest">Lowest Cost (Cheapest)</option> <option value="balanced">Balanced</option> </Select>
                        </div>
                        {/* Action Button */}
                        <Button onClick={handleCompareOptions} disabled={isLoading || isSaving || !startLocation || !endLocation} className="w-full mt-2"> {isLoading ? 'Comparing...' : 'Compare Options'} </Button>
                        {/* Messages */}
                        <div className="h-6 mt-2 text-center"> {error && <p className="text-red-600 text-sm animate-pulse">{error}</p>} {saveSuccessMessage && <p className="text-green-600 text-sm">{saveSuccessMessage}</p>} </div>
                    </CardContent>
                 </Card>

                {/* Comparison Results Panel */}
                <div className="flex-1 overflow-y-auto pb-4">
                     <h2 className="text-xl font-semibold text-gray-800 mb-4">Travel Options</h2>
                     {/* Loading Spinner */}
                     {isLoading && ( <div className="flex justify-center items-center h-40"> <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div> </div> )}
                     {/* Initial Prompt */}
                     {!isLoading && comparisonResults.length === 0 && !error && ( <div className="text-center text-gray-500 p-10 bg-white rounded-lg shadow"> Enter locations and click compare to see travel options. </div> )}
                    {/* Results Grid */}
                    {!isLoading && comparisonResults.length > 0 && (
                         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                             {comparisonResults.map((option, index) => {
                                const IconComponent = modeIcons[option.mode] || modeIcons.Default;
                                return (
                                    <Card key={index} className={`transition duration-300 ease-in-out hover:shadow-xl ${ option.is_recommended ? 'border-2 border-green-500 ring-2 ring-green-200' : 'border border-gray-200'}`}>
                                        <CardHeader className="flex justify-between items-center bg-gray-50">
                                            <CardTitle Icon={IconComponent}>{option.mode}</CardTitle>
                                            {option.is_recommended && ( <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center"> <Star className="mr-1 h-3 w-3" /> Recommended </span> )}
                                        </CardHeader>
                                        <CardContent> {renderOptionDetails(option)} </CardContent>
                                        <div className="p-4 border-t border-gray-100 mt-auto">
                                            {/* Button now calls the modified handler */}
                                            <Button onClick={() => handleChooseOption(option)} disabled={isSaving} className="w-full text-sm bg-indigo-500 hover:bg-indigo-600" Icon={CheckCircle}>
                                                {isSaving ? 'Processing...' : 'Select this Option'} {/* Updated button text */}
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
            {/* Pass the necessary context as props to the Chatbot */}
            <Chatbot
                startLocation={startLocation}
                endLocation={endLocation}
                preference={preference}
                comparisonResults={comparisonResults}
            />
        </div>
    );
}

export default App; // Export the main App component

