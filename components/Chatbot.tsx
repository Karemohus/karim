import React, { useState, useEffect, useRef } from 'react';
import { SiteSettings, ChatMessage, ChatbotSettings, Property, MaintenanceRequest, EmergencyMaintenanceRequest } from '../types';
import { createGeneralChat } from '../services/geminiService';
import { ChatBubbleLeftEllipsisIcon, XMarkIcon, PaperAirplaneIcon, CogIcon, SparklesIcon, UserIcon } from './icons';
import type { Chat } from '@google/genai';

interface ChatbotProps {
    siteSettings: SiteSettings;
    chatbotSettings: ChatbotSettings;
    properties: Property[];
    maintenanceRequests: MaintenanceRequest[];
    emergencyMaintenanceRequests: EmergencyMaintenanceRequest[];
}

const Chatbot: React.FC<ChatbotProps> = ({ siteSettings, chatbotSettings, properties, maintenanceRequests, emergencyMaintenanceRequests }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userInput, setUserInput] = useState('');
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && !chatRef.current) {
            try {
                chatRef.current = createGeneralChat(chatbotSettings, siteSettings.siteName, properties, maintenanceRequests, emergencyMaintenanceRequests);
                // Send an empty message to get the initial greeting
                getInitialMessage();
            } catch (error) {
                console.error("Failed to initialize chatbot:", error);
                setMessages([{ role: 'model', parts: [{ text: "عذراً، المساعد الآلي غير متاح حالياً." }] }]);
            }
        }
    }, [isOpen, siteSettings, chatbotSettings, properties, maintenanceRequests, emergencyMaintenanceRequests]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const getInitialMessage = async () => {
        if (!chatRef.current) return;
        setIsLoading(true);
        try {
            // The system prompt now handles the initial greeting, so we send a simple message to trigger it.
            const result = await chatRef.current.sendMessageStream({ message: "أهلاً" });
            let text = '';
            for await (const chunk of result) {
                // The .text property gives the full aggregated text so far.
                text = chunk.text;
            }
            // Only add the message if it's not empty, to avoid blank bubbles.
            if (text.trim()) {
                setMessages([{ role: 'model', parts: [{ text }] }]);
            }
        } catch (error) {
            console.error("Chatbot initial message error:", error);
            setMessages([{ role: 'model', parts: [{ text: "أواجه مشكلة في الاتصال. الرجاء المحاولة لاحقاً." }] }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput || isLoading || !chatRef.current) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: trimmedInput }] };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const stream = await chatRef.current.sendMessageStream({ message: trimmedInput });
            
            let messageStarted = false;

            for await (const chunk of stream) {
                const chunkText = chunk.text;
                if (!messageStarted) {
                    messageStarted = true;
                    // Add a new message object for the model's response
                    setMessages(prev => [...prev, { role: 'model', parts: [{ text: chunkText }] }]);
                } else {
                    // Update the last message (the model's response)
                    setMessages(prev => {
                        const newMessages = [...prev];
                        if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'model') {
                             newMessages[newMessages.length - 1].parts = [{ text: chunkText }];
                        }
                        return newMessages;
                    });
                }
            }
        } catch (error) {
            console.error("Chatbot send message error:", error);
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "عذراً، حدث خطأ ما. الرجاء المحاولة مرة أخرى." }] };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* FAB */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className={`fixed bottom-6 left-6 z-50 bg-indigo-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-all duration-300 transform ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
                aria-label="افتح المساعد الآلي"
            >
                <ChatBubbleLeftEllipsisIcon className="w-8 h-8" />
            </button>
            
            {/* Chat Window */}
            <div className={`fixed bottom-6 left-6 z-50 w-[90vw] max-w-sm h-[70vh] max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-left ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="w-6 h-6 text-indigo-500"/>
                        <h3 className="font-bold text-lg text-gray-800">مساعدك الشخصي</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="w-6 h-6"/>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-grow p-4 overflow-y-auto bg-gray-50 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <SparklesIcon className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-1"/>}
                            <div className={`max-w-xs p-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                <p className="whitespace-pre-wrap text-sm">{msg.parts.map(p => (p as any).text).join('')}</p>
                            </div>
                            {msg.role === 'user' && <UserIcon className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1"/>}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3 justify-start">
                            <SparklesIcon className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-1"/>
                            <div className="p-3 bg-gray-200 rounded-2xl rounded-bl-none flex items-center space-x-1">
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex-shrink-0 flex items-center gap-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="اكتب سؤالك هنا..."
                        className="w-full p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition-colors disabled:bg-indigo-300">
                        {isLoading ? <CogIcon className="w-6 h-6 animate-spin"/> : <PaperAirplaneIcon className="w-6 h-6"/>}
                    </button>
                </form>
            </div>
        </>
    );
};

export default Chatbot;
