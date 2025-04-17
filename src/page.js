import React, { useState, useEffect, useRef } from 'react';

// --- Mock shadcn/ui Components ---
// In a real project, you'd install and import these:
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ScrollArea } from "@/components/ui/scroll-area";
// For this example, we'll use basic styled HTML elements.

// --- Helper Components (Basic Styling) ---

const Label = ({ children, ...props }) => <label className="block text-sm font-medium text-gray-700 mb-1" {...props}>{children}</label>;
const Input = (props) => <input className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" {...props} />;
const Button = ({ children, ...props }) => <button className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50" {...props}>{children}</button>;
const Select = ({ children, ...props }) => <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white" {...props}>{children}</select>;
const Card = ({ children, ...props }) => <div className="bg-white shadow-lg rounded-lg overflow-hidden" {...props}>{children}</div>;
const CardHeader = ({ children, ...props }) => <div className="p-4 border-b border-gray-200" {...props}>{children}</div>;
const CardTitle = ({ children, ...props }) => <h3 className="text-lg leading-6 font-medium text-gray-900" {...props}>{children}</h3>;
const CardContent = ({ children, ...props }) => <div className="p-4" {...props}>{children}</div>;
const ScrollArea = ({ children, ...props }) => <div className="overflow-y-auto h-full" {...props}>{children}</div>;

// --- Main App Component ---

function App() {
  // --- State Variables ---
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [preference, setPreference] = useState('greenest'); // Default preference
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]); // Stores { type: 'user'/'ai', text: 'message' }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null); // Ref to scroll to bottom of chat

  // API endpoint URL (make sure your FastAPI backend is running here)
  const API_URL = 'http://127.0.0.1:8000/chat'; // Default FastAPI address

  // --- Effects ---
  // Scroll to the bottom of the chat window when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // --- Event Handlers ---
  const handleSendMessage = async (e) => {
    e.preventDefault(); // Prevent default form submission if used in a form

    // Basic validation
    if (!startLocation || !endLocation) {
      setError('Please enter both Start and End locations.');
      return;
    }
    if (!currentMessage.trim()) {
        setError('Please enter a message.');
        return;
    }

    const userMessage = currentMessage.trim();
    const newMessage = { type: 'user', text: userMessage };

    // Update chat history immediately with user message
    setChatHistory(prev => [...prev, newMessage]);
    setCurrentMessage(''); // Clear input field
    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      // Prepare request body
      const requestBody = {
        start_location: startLocation,
        end_location: endLocation,
        preference: preference,
        user_message: userMessage,
      };

      // Send request to the FastAPI backend
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json', // Explicitly accept JSON
        },
        body: JSON.stringify(requestBody),
      });

      // Check if the response is ok (status code 200-299)
      if (!response.ok) {
        // Try to parse error message from backend if available
        let errorDetail = `HTTP error! Status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorDetail; // Use backend detail if present
        } catch (jsonError) {
            // If response is not JSON or parsing fails, use status text
            errorDetail = response.statusText || errorDetail;
        }
        throw new Error(errorDetail);
      }

      // Parse the JSON response
      const data = await response.json();

      // Add AI response to chat history
      if (data.ai_response) {
        setChatHistory(prev => [...prev, { type: 'ai', text: data.ai_response }]);
      } else {
         throw new Error("Received empty response from AI.");
      }

    } catch (err) {
      console.error("API Call failed:", err);
      setError(err.message || 'Failed to fetch response from the server.');
      // Optionally add an error message to chat history
      setChatHistory(prev => [...prev, { type: 'ai', text: `Sorry, an error occurred: ${err.message}` }]);
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  // --- JSX Rendering ---
  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-semibold">Sustainable Travel Planner Chatbot</h1>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden p-4 space-x-4">

        {/* Configuration Panel */}
        <Card className="w-1/3 flex-shrink-0">
          <CardHeader>
            <CardTitle>Travel Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="start-location">Start Location</Label>
              <Input
                id="start-location"
                type="text"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                placeholder="e.g., Eiffel Tower, Paris"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="end-location">End Location</Label>
              <Input
                id="end-location"
                type="text"
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
                placeholder="e.g., Louvre Museum, Paris"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="preference">Travel Preference</Label>
              <Select
                id="preference"
                value={preference}
                onValueChange={setPreference} // For shadcn Select
                onChange={(e) => setPreference(e.target.value)} // For standard select
                disabled={isLoading}
              >
                {/* <SelectTrigger> <SelectValue placeholder="Select preference" /> </SelectTrigger> */}
                {/* <SelectContent> */}
                  <option value="greenest">Greenest</option>
                  <option value="fastest">Fastest</option>
                  <option value="cheapest">Cheapest</option>
                  <option value="balanced">Balanced</option>
                {/* </SelectContent> */}
              </Select>
            </div>
             {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        {/* Chat Panel */}
        <Card className="flex-1 flex flex-col">
           <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          {/* Chat History Area */}
           <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4"> {/* Added padding-right */}
                    <div className="space-y-4">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                            msg.type === 'user'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                        >
                            {/* Render newlines correctly */}
                            {msg.text.split('\n').map((line, i) => (
                                <span key={i}>{line}<br/></span>
                            ))}
                        </div>
                        </div>
                    ))}
                    {/* Dummy div to ensure scrolling to bottom works */}
                    <div ref={chatEndRef} />
                    </div>
                </ScrollArea>
            </CardContent>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask about your trip..."
                className="flex-1"
                disabled={isLoading || !startLocation || !endLocation} // Disable if loading or locations missing
              />
              <Button
                type="submit"
                disabled={isLoading || !currentMessage.trim() || !startLocation || !endLocation}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App; // Ensure App is the default export

// --- How to Use ---
// 1. Ensure you have Node.js and npm/yarn installed.
// 2. Create a new React project (e.g., using Create React App or Vite): `npx create-react-app travel-chatbot-ui` or `npm create vite@latest travel-chatbot-ui -- --template react`
// 3. Navigate into the project directory: `cd travel-chatbot-ui`
// 4. Install Tailwind CSS: Follow the official Tailwind CSS guide for your setup (https://tailwindcss.com/docs/installation).
// 5. (Optional but Recommended) Install shadcn/ui components if desired: Follow instructions at https://ui.shadcn.com/docs/installation. If not using shadcn, the basic styled elements provided above will work.
// 6. Replace the content of `src/App.js` (or `src/App.jsx`) with the code above.
// 7. Ensure your FastAPI backend (from `main.py` and `model_logic.py`) is running on `http://127.0.0.1:8000`.
// 8. Start the React development server: `npm start` or `yarn start` (for Create React App) or `npm run dev` / `yarn dev` (for Vite).
// 9. Open your browser to the address provided by the development server (usually http://localhost:3000 or http://localhost:5173).
