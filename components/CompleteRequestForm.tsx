
import React, { useState } from 'react';

interface CompleteRequestFormProps {
    onSubmit: (details: { problemCause: string; solution: string; amountPaid: number; }) => void;
    onCancel: () => void;
}

const CompleteRequestForm: React.FC<CompleteRequestFormProps> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        problemCause: '',
        solution: '',
        amountPaid: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const amount = parseFloat(formData.amountPaid);
        if (isNaN(amount) || amount < 0) {
            setError('الرجاء إدخال مبلغ صحيح.');
            return;
        }

        if (!formData.problemCause.trim() || !formData.solution.trim()) {
            setError('الرجاء تعبئة جميع الحقول.');
            return;
        }
        
        onSubmit({
            problemCause: formData.problemCause,
            solution: formData.solution,
            amountPaid: amount,
        });
    };

    const inputClass = "w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="problemCause" className={labelClass}>سبب المشكلة</label>
                <textarea 
                    id="problemCause" 
                    name="problemCause" 
                    value={formData.problemCause} 
                    onChange={handleChange} 
                    rows={3} 
                    className={inputClass} 
                    required 
                    placeholder="وصف التشخيص النهائي للمشكلة..."
                />
            </div>
            <div>
                <label htmlFor="solution" className={labelClass}>ما تم إصلاحه</label>
                <textarea 
                    id="solution" 
                    name="solution" 
                    value={formData.solution} 
                    onChange={handleChange} 
                    rows={3} 
                    className={inputClass} 
                    required 
                    placeholder="وصف تفصيلي للحل والأعمال التي تمت..."
                />
            </div>
            <div>
                <label htmlFor="amountPaid" className={labelClass}>المبلغ المدفوع (بالريال)</label>
                <input 
                    type="number" 
                    id="amountPaid" 
                    name="amountPaid" 
                    value={formData.amountPaid} 
                    onChange={handleChange} 
                    className={inputClass} 
                    required 
                    min="0"
                    step="0.01"
                />
            </div>

            {error && (
                 <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm" role="alert">
                    <p>{error}</p>
                </div>
            )}
            
            <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                    إلغاء
                </button>
                <button type="submit" className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    تأكيد وإكمال الطلب
                </button>
            </div>
        </form>
    );
};

export default CompleteRequestForm;