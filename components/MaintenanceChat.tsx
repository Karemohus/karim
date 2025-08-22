
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { SparklesIcon, UserIcon, PaperAirplaneIcon, PaperClipIcon, TrashIcon, CogIcon } from './icons';

interface MaintenanceChatProps {
    history: ChatMessage[];
    onSubmit: (userText: string, files: File[]) => void;
    isLoading: boolean;
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1 p-2">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
    </div>
);

const MaintenanceChat: React.FC<MaintenanceChatProps> = ({ history, onSubmit, isLoading }) => {
    const [userText, setUserText] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isLoading]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((!userText.trim() && files.length === 0) || isLoading) return;
        onSubmit(userText, files);
        setUserText('');
        setFiles([]);
    };

    const renderMessageContent = (msg: ChatMessage) => {
        return msg.parts.map((part, index) => {
            if ('text' in part && part.text) {
                return <p key={index} className="whitespace-pre-wrap">{part.text}</p>;
            }
            if ('inlineData' in part) {
                const url = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                return <img key={index} src={url} alt="Uploaded content" className="mt-2 rounded-lg max-w-xs max-h-48 object-contain" />;
            }
            return null;
        });
    };

    return (
        <div className="mt-8 p-4 sm:p-6 bg-white rounded-2xl shadow-xl border border-gray-200 animate-fade-in flex flex-col max-h-[80vh]">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <SparklesIcon className="w-7 h-7 text-indigo-500" />
                <h3 className="text-xl font-bold text-gray-900">مساعد الصيانة الذكي</h3>
            </div>
            
            {/* Chat History */}
            <div className="flex-grow overflow-y-auto space-y-6 p-4 bg-gray-50/70 rounded-lg">
                {history.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center ring-2 ring-white">
                                <SparklesIcon className="w-5 h-5 text-indigo-500"/>
                            </div>
                        )}
                        <div className={`max-w-md lg:max-w-lg p-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                            {renderMessageContent(msg)}
                        </div>
                         {msg.role === 'user' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-white">
                                <UserIcon className="w-5 h-5 text-gray-600"/>
                            </div>
                        )}
                    </div>
                ))}
                 {isLoading && (
                     <div className="flex items-end gap-3 justify-start">
                         <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center ring-2 ring-white">
                            <SparklesIcon className="w-5 h-5 text-indigo-500"/>
                        </div>
                        <div className="bg-gray-200 text-gray-800 rounded-2xl rounded-bl-none p-2">
                           <TypingIndicator />
                        </div>
                     </div>
                 )}
                <div ref={endOfMessagesRef} />
            </div>

            {/* Input Area */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                {files.length > 0 && (
                    <div className="mb-2 p-2 bg-gray-100 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 mb-2">الملفات المرفقة:</p>
                        <div className="flex flex-wrap gap-2">
                            {files.map((file, index) => (
                                <div key={index} className="relative bg-gray-200 p-1.5 rounded-md flex items-center gap-2 text-sm">
                                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-10 h-10 object-cover rounded"/>
                                    <span className="text-gray-700 max-w-[100px] truncate">{file.name}</span>
                                    <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <label htmlFor="chat-file-upload" className="flex-shrink-0 p-2 text-gray-500 hover:text-indigo-600 cursor-pointer hover:bg-gray-100 rounded-full transition-colors">
                        <PaperClipIcon className="w-6 h-6"/>
                        <input id="chat-file-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleFileChange} disabled={isLoading} />
                    </label>
                    <input
                        type="text"
                        value={userText}
                        onChange={e => setUserText(e.target.value)}
                        placeholder="اكتب ردك هنا..."
                        className="w-full p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 transition-shadow"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={(!userText.trim() && files.length === 0) || isLoading} className="flex-shrink-0 bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed">
                        {isLoading ? <CogIcon className="w-6 h-6 animate-spin"/> : <PaperAirplaneIcon className="w-6 h-6"/>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MaintenanceChat;
