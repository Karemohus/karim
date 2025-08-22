
import React, { useState } from 'react';
import { Property, PropertyComparison } from '../types';
import { comparePropertiesWithAI } from '../services/geminiService';
import Modal from './Modal';
import { SparklesIcon, CogIcon } from './icons';

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertiesToCompare: Property[];
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ isOpen, onClose, propertiesToCompare }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<PropertyComparison | null>(null);

    const handleCompare = async () => {
        if (!query.trim()) {
            setError('الرجاء إدخال معايير المقارنة.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const comparison = await comparePropertiesWithAI(propertiesToCompare, query);
            setResult(comparison);
        } catch (err) {
            setError('حدث خطأ أثناء المقارنة. الرجاء المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // reset state on close
    const handleClose = () => {
        setQuery('');
        setResult(null);
        setError(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="مقارنة العقارات بالذكاء الاصطناعي" size="lg">
            <div className="p-2">
                <div className="flex gap-4 mb-6">
                    {propertiesToCompare.map(prop => (
                        <div key={prop.id} className="flex-1 bg-gray-50 p-3 rounded-lg border">
                            <img src={prop.imageUrls[0]} alt={prop.title} className="w-full h-24 object-cover rounded-md mb-2"/>
                            <h4 className="font-bold text-sm truncate">{prop.title}</h4>
                            <p className="text-xs text-gray-500 truncate">{prop.location}</p>
                        </div>
                    ))}
                </div>

                {!result && !isLoading && (
                     <div>
                        <label htmlFor="comparisonQuery" className="block text-sm font-medium text-gray-700 mb-2">
                            ما هي أهم معايير المقارنة بالنسبة لك؟
                        </label>
                        <textarea
                            id="comparisonQuery"
                            rows={3}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="مثال: قارن بينها من حيث القرب من المدارس والخدمات، وهدوء الحي..."
                            disabled={isLoading}
                        />
                         {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleCompare}
                                disabled={isLoading || !query.trim()}
                                className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
                            >
                                {isLoading ? <CogIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
                                <span>{isLoading ? 'جاري المقارنة...' : 'قارن الآن'}</span>
                            </button>
                        </div>
                    </div>
                )}
                
                {isLoading && (
                    <div className="text-center p-8">
                        <CogIcon className="animate-spin h-10 w-10 mx-auto text-indigo-500" />
                        <p className="mt-4 font-semibold text-gray-700">يقوم الذكاء الاصطناعي بإعداد المقارنة...</p>
                    </div>
                )}
                
                {result && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">توصيتنا لك</h3>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <p className="font-bold text-green-800">{result.recommendation}</p>
                                <p className="text-sm text-green-700 mt-1">{result.recommendation_reason}</p>
                            </div>
                        </div>
                        <div>
                             <h3 className="text-xl font-bold text-gray-800 mb-3">تفاصيل المقارنة</h3>
                            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                                {result.comparison_points.map((point, index) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                                        <h4 className="font-bold text-indigo-700 mb-3">{point.feature}</h4>
                                        <div className="space-y-3">
                                            {point.details.map((detail, dIndex) => (
                                                <div key={dIndex} className="pb-2 border-b border-gray-200 last:border-b-0">
                                                    <p className="font-semibold text-gray-800 text-sm">{detail.property_title}</p>
                                                    <p className="text-gray-600 text-sm">{detail.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                             <button onClick={handleClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-5 rounded-lg hover:bg-gray-300">
                                إغلاق
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ComparisonModal;
