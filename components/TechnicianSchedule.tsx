
import React, { useState, useMemo } from 'react';
import { Technician, MaintenanceRequest } from '../types';
import { ArrowLeftIcon, ArrowRightIcon } from './icons';

// Manual date functions to avoid new dependencies
const startOfWeek = (date: Date, weekStartsOn: 0 | 1 = 0) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

const addDays = (date: Date, amount: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + amount);
    return d;
};

const subDays = (date: Date, amount: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() - amount);
    return d;
};

const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

const format = (date: Date, formatStr: string) => {
    const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    if (formatStr === 'EEEE') {
        return dayNames[date.getDay()];
    }
    if (formatStr === 'd/M') {
        return `${date.getDate()}/${date.getMonth() + 1}`;
    }
    if (formatStr === 'd MMM') {
        return `${date.getDate()} ${monthNames[date.getMonth()]}`;
    }
    if (formatStr === 'd MMM yyyy') {
        return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    }
    return date.toString();
};

const parseISO = (isoString: string) => new Date(isoString);


// Draggable Request Card Component
const RequestCard: React.FC<{ request: MaintenanceRequest, isAssigned?: boolean }> = ({ request, isAssigned = false }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        if (isAssigned) {
            e.dataTransfer.setData('unassignRequestId', request.id);
        } else {
            e.dataTransfer.setData('assignRequestId', request.id);
        }
    };

    const cardClass = isAssigned
      ? 'bg-indigo-100 border-indigo-300'
      : 'bg-white border-gray-300 hover:border-indigo-500';
    const titleClass = isAssigned ? 'text-indigo-800' : 'text-gray-800';
    const subtitleClass = isAssigned ? 'text-indigo-600' : 'text-gray-500';

    return (
        <div 
            draggable 
            onDragStart={handleDragStart}
            className={`p-2.5 rounded-lg border shadow-sm cursor-grab hover:shadow-md transition-all mb-2 ${cardClass}`}
        >
            <p className={`font-bold text-sm truncate ${titleClass}`}>{request.analysis.summary}</p>
            <p className={`text-xs truncate ${subtitleClass}`}>{request.userName} - #{request.id.slice(-6)}</p>
        </div>
    );
};

// Schedule Cell (Drop Target) Component
const ScheduleCell: React.FC<{ 
    date: Date;
    technician: Technician;
    children: React.ReactNode;
    onDropRequest: (requestId: string, technicianId: string, date: Date) => void;
}> = ({ date, technician, children, onDropRequest }) => {
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };
    
    const handleDragLeave = () => setIsOver(false);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const requestId = e.dataTransfer.getData('assignRequestId');
        if (requestId) {
            onDropRequest(requestId, technician.id, date);
        }
        setIsOver(false);
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`p-2 border-t border-r border-gray-200 min-h-[120px] transition-colors ${isOver ? 'bg-indigo-100' : 'bg-gray-50'}`}
        >
            {children}
        </div>
    );
};

interface TechnicianScheduleProps {
    technicians: Technician[];
    requests: MaintenanceRequest[];
    setRequests: React.Dispatch<React.SetStateAction<MaintenanceRequest[]>>;
}

const TechnicianSchedule: React.FC<TechnicianScheduleProps> = ({ technicians, requests, setRequests }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const weekStart = startOfWeek(currentDate, 0); // Sunday

    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
    }, [weekStart]);

    const unassignedRequests = requests.filter(r => !r.assignedTechnicianId && ['جديد', 'قيد التنفيذ'].includes(r.status));

    const handleDropRequest = (requestId: string, technicianId: string, date: Date) => {
        setRequests(prevRequests => 
            prevRequests.map(req => 
                req.id === requestId 
                ? { 
                    ...req, 
                    assignedTechnicianId: technicianId, 
                    scheduledDate: date.toISOString(),
                    status: 'قيد التنفيذ' 
                  } 
                : req
            )
        );
    };

    const handleUnassignRequest = (requestId: string) => {
         setRequests(prevRequests => 
            prevRequests.map(req => 
                req.id === requestId 
                ? { 
                    ...req, 
                    assignedTechnicianId: null, 
                    scheduledDate: null,
                    status: 'جديد' 
                  } 
                : req
            )
        );
    };

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-6">
            {/* Schedule Grid */}
            <div className="flex-grow">
                {/* Week Navigation */}
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCurrentDate(subDays(currentDate, 7))} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Previous week">
                        <ArrowRightIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <h3 className="text-lg font-bold text-gray-800 text-center">
                        الأسبوع من {format(weekDays[0], 'd MMM')} إلى {format(weekDays[6], 'd MMM yyyy')}
                    </h3>
                    <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Next week">
                        <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
                
                {/* Grid */}
                <div className="border-l border-b border-gray-200 bg-white overflow-x-auto">
                    <div className="min-w-[900px]">
                        {/* Header */}
                        <div className="grid grid-cols-[150px_repeat(7,1fr)]">
                            <div className="p-3 font-bold text-gray-700 border-t border-r border-gray-200 bg-gray-100 sticky left-0 z-10">الفني</div>
                            {weekDays.map(day => (
                                <div key={day.toISOString()} className="p-3 text-center font-bold text-gray-700 border-t border-r border-gray-200 bg-gray-100">
                                    <p>{format(day, 'EEEE')}</p>
                                    <p className="text-sm font-normal text-gray-500">{format(day, 'd/M')}</p>
                                </div>
                            ))}
                        </div>
                        {/* Body */}
                        {technicians.filter(t => t.isAvailable).map(tech => (
                            <div key={tech.id} className="grid grid-cols-[150px_repeat(7,1fr)]">
                                <div className="p-3 border-t border-r border-gray-200 flex flex-col items-center justify-center bg-white sticky left-0 z-10">
                                    <p className="font-bold text-center">{tech.name}</p>
                                    <p className="text-xs text-gray-500">{tech.specialization}</p>
                                </div>
                                {weekDays.map(day => {
                                    const dayRequests = requests.filter(r => 
                                        r.assignedTechnicianId === tech.id && r.scheduledDate && isSameDay(parseISO(r.scheduledDate), day)
                                    );
                                    return (
                                        <ScheduleCell key={day.toISOString()} date={day} technician={tech} onDropRequest={handleDropRequest}>
                                            {dayRequests.map(req => (
                                                <RequestCard key={req.id} request={req} isAssigned={true} />
                                            ))}
                                        </ScheduleCell>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Unassigned Requests Panel */}
            <div 
                className="w-full lg:w-72 flex-shrink-0"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    const requestId = e.dataTransfer.getData('unassignRequestId');
                    if(requestId) handleUnassignRequest(requestId);
                }}
            >
                <h3 className="text-lg font-bold text-gray-800 mb-4">طلبات غير معينة ({unassignedRequests.length})</h3>
                <div className="bg-gray-100 p-3 rounded-lg h-[40vh] lg:h-[70vh] overflow-y-auto border">
                    {unassignedRequests.length > 0 ? (
                        unassignedRequests.map(req => <RequestCard key={req.id} request={req} />)
                    ) : (
                        <p className="text-center text-gray-500 text-sm mt-4">لا توجد طلبات جديدة.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TechnicianSchedule;
