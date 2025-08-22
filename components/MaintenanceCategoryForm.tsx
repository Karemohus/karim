

import React, { useState, useEffect } from 'react';
import { MaintenanceCategory, CommonIssue } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, XMarkIcon } from './icons';

interface MaintenanceCategoryFormProps {
    initialData?: MaintenanceCategory | null;
    onSubmit: (data: MaintenanceCategory) => void;
    onCancel: () => void;
}

const DEFAULT_CATEGORY: Omit<MaintenanceCategory, 'id'> = {
    name: '',
    description: '',
    commonIssues: [],
    inspectionFee: 0,
};

const MaintenanceCategoryForm: React.FC<MaintenanceCategoryFormProps> = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(DEFAULT_CATEGORY);
    const [newIssueName, setNewIssueName] = useState('');
    const [newIssueWarranty, setNewIssueWarranty] = useState<number>(7);
    const [newIssueMinCost, setNewIssueMinCost] = useState<number>(50);
    const [newIssueMaxCost, setNewIssueMaxCost] = useState<number>(150);
    const [editingIssueId, setEditingIssueId] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({ ...DEFAULT_CATEGORY, ...initialData });
        } else {
            setFormData(DEFAULT_CATEGORY);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isNumberField = type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumberField ? Number(value) : value }));
    };
    
    const handleSaveIssue = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedIssueName = newIssueName.trim();
        if (!trimmedIssueName) return;
        if (newIssueMinCost > newIssueMaxCost) {
            alert("أقل تكلفة لا يمكن أن تكون أكبر من أعلى تكلفة.");
            return;
        }

        if (editingIssueId) {
            // Update existing issue
            const updatedIssues = formData.commonIssues.map(issue =>
                issue.id === editingIssueId
                    ? { ...issue, name: trimmedIssueName, warrantyDays: newIssueWarranty, minCost: newIssueMinCost, maxCost: newIssueMaxCost }
                    : issue
            );
            setFormData(prev => ({ ...prev, commonIssues: updatedIssues }));
            handleCancelEdit();
        } else {
            // Add new issue
            if (!formData.commonIssues.find(i => i.name === trimmedIssueName)) {
                const newIssue: CommonIssue = {
                    id: `ci-${Date.now()}`,
                    name: trimmedIssueName,
                    warrantyDays: newIssueWarranty,
                    minCost: newIssueMinCost,
                    maxCost: newIssueMaxCost,
                };
                setFormData(prev => ({ ...prev, commonIssues: [...prev.commonIssues, newIssue]}));
                setNewIssueName('');
                setNewIssueWarranty(7);
                setNewIssueMinCost(50);
                setNewIssueMaxCost(150);
            }
        }
    };
    
    const handleRemoveIssue = (idToRemove: string) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا العطل الشائع؟')) {
            setFormData(prev => ({
                ...prev,
                commonIssues: prev.commonIssues.filter(issue => issue.id !== idToRemove)
            }));
             if (editingIssueId === idToRemove) {
                handleCancelEdit();
            }
        }
    };

    const handleStartEdit = (issue: CommonIssue) => {
        setEditingIssueId(issue.id);
        setNewIssueName(issue.name);
        setNewIssueWarranty(issue.warrantyDays);
        setNewIssueMinCost(issue.minCost);
        setNewIssueMaxCost(issue.maxCost);
    };

    const handleCancelEdit = () => {
        setEditingIssueId(null);
        setNewIssueName('');
        setNewIssueWarranty(7);
        setNewIssueMinCost(50);
        setNewIssueMaxCost(150);
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert("اسم الفئة مطلوب.");
            return;
        }
        
        const finalData: MaintenanceCategory = {
            ...formData,
            id: initialData?.id || `mcat-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            inspectionFee: Number(formData.inspectionFee) || 0,
        };
        onSubmit(finalData);
    };

    const inputClass = "w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";
    const subLabelClass = "block text-xs font-medium text-gray-500 mb-1";


    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="name" className={labelClass}>اسم الفئة</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
                </div>
                 <div>
                    <label htmlFor="inspectionFee" className={labelClass}>رسوم الكشف (بالريال)</label>
                    <input type="number" id="inspectionFee" name="inspectionFee" value={formData.inspectionFee} onChange={handleChange} min="0" className={inputClass} />
                </div>
            </div>
            
            <div>
                <label htmlFor="description" className={labelClass}>وصف الفئة</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClass} />
            </div>

            <div>
                <label className={labelClass}>{editingIssueId ? 'تعديل العطل الشائع' : 'إضافة عطل شائع جديد'}</label>
                <form onSubmit={handleSaveIssue} className="p-3 bg-gray-100 rounded-lg border space-y-3">
                     <div>
                        <label className={subLabelClass}>اسم العطل</label>
                        <input
                            type="text"
                            value={newIssueName}
                            onChange={(e) => setNewIssueName(e.target.value)}
                            placeholder="مثال: تسريب صنبور"
                            className={inputClass}
                            required
                        />
                     </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                         <div>
                             <label className={subLabelClass}>أقل تكلفة (ريال)</label>
                             <input
                                type="number"
                                value={newIssueMinCost}
                                onChange={(e) => setNewIssueMinCost(Number(e.target.value))}
                                min="0"
                                className={inputClass}
                                placeholder="50"
                                required
                            />
                         </div>
                        <div>
                            <label className={subLabelClass}>أعلى تكلفة (ريال)</label>
                            <input
                                type="number"
                                value={newIssueMaxCost}
                                onChange={(e) => setNewIssueMaxCost(Number(e.target.value))}
                                min={newIssueMinCost}
                                className={inputClass}
                                placeholder="150"
                                required
                            />
                        </div>
                        <div>
                            <label className={subLabelClass}>ضمان (أيام)</label>
                             <input
                                type="number"
                                value={newIssueWarranty}
                                onChange={(e) => setNewIssueWarranty(Number(e.target.value))}
                                min="0"
                                className={inputClass}
                                placeholder="7"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                         <button type="submit" className={`${editingIssueId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2`} aria-label={editingIssueId ? "Update Issue" : "Add Issue"}>
                            {editingIssueId ? 'حفظ التعديل' : <><PlusIcon className="w-5 h-5"/> إضافة</>}
                        </button>
                        {editingIssueId && (
                             <button type="button" onClick={handleCancelEdit} className="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2" aria-label="Cancel Edit">
                                <XMarkIcon className="w-5 h-5"/> إلغاء
                            </button>
                        )}
                    </div>
                </form>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 border rounded-md p-2 bg-gray-50 mt-3">
                    {formData.commonIssues.length > 0 ? (
                        formData.commonIssues.map((issue) => (
                            <div key={issue.id} className={`flex items-center justify-between p-2 rounded-md border transition-colors ${editingIssueId === issue.id ? 'bg-indigo-100 border-indigo-300' : 'bg-white'}`}>
                                <span className="text-gray-800 font-medium">{issue.name}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">{issue.minCost}-{issue.maxCost} ريال</span>
                                  <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">{issue.warrantyDays} يوم ضمان</span>
                                  <button
                                      type="button"
                                      onClick={() => handleStartEdit(issue)}
                                      className="text-gray-500 hover:text-indigo-700 p-1 hover:bg-gray-200 rounded-full"
                                      aria-label={`Edit ${issue.name}`}
                                  >
                                      <PencilIcon className="w-5 h-5" />
                                  </button>
                                  <button
                                      type="button"
                                      onClick={() => handleRemoveIssue(issue.id)}
                                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-100 rounded-full"
                                      aria-label={`Remove ${issue.name}`}
                                  >
                                      <TrashIcon className="w-5 h-5" />
                                  </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-2">لا توجد أعطال شائعة مضافة بعد.</p>
                    )}
                </div>
            </div>
            
            <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                    إلغاء
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    {initialData ? 'حفظ التعديلات' : 'إضافة الفئة'}
                </button>
            </div>
        </form>
    );
};

export default MaintenanceCategoryForm;