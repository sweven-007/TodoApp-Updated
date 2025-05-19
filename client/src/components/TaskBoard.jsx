import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const initialTasks = {
    todo: {
        name: 'To Do',
        tasks: [
            { id: uuidv4(), title: 'Task 1', createdAt: new Date().toISOString() },
            { id: uuidv4(), title: 'Task 2', createdAt: new Date().toISOString() },
        ],
    },
    inProgress: {
        name: 'In Progress',
        tasks: [],
    },
    done: {
        name: 'Done',
        tasks: [],
    },
};

// Format date safely to prevent "Invalid Date" displays
const formatDate = (dateString) => {
    try {
        const date = new Date(dateString);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return "Just now";
        }
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    } catch (error) {
        return "Just now";
    }
};

// Create a component for drag overlay
const DragOverlayItem = ({ title }) => {
    return (
        <div className="bg-white shadow-xl p-4 mb-3 rounded-lg border-2 border-indigo-300 flex flex-col touch-none rotate-1 scale-105 w-[300px] pointer-events-none">
            <div className="absolute top-0 left-0 w-1 h-full rounded-l-lg bg-indigo-400"></div>
            <h3 className="font-medium text-gray-800 pl-2">{title}</h3>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-400">Moving task...</div>
                <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
            </div>
        </div>
    );
};

function Task({ id, title, createdAt, onDelete, onEdit }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });
    
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(title);
    const [isHovered, setIsHovered] = useState(false);
    
    const formattedDate = formatDate(createdAt);
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1000 : 1,
        opacity: isDragging ? 0.4 : 1, // Make the original item more transparent when dragging
    };
    
    const handleSave = () => {
        if (editValue.trim()) {
            onEdit(id, editValue);
            setIsEditing(false);
        }
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setEditValue(title);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(isEditing ? {} : { ...attributes, ...listeners })}
            className={`task-item bg-white shadow-md p-4 mb-3 rounded-lg border border-gray-100 
                flex flex-col touch-none transition-all duration-200 
                ${isDragging ? 'ring-2 ring-indigo-300 shadow-xl' : ''} 
                ${isHovered ? 'shadow-lg border-indigo-100' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isEditing ? (
                <div className="flex flex-col gap-2 w-full">
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => { setIsEditing(false); setEditValue(title); }}
                            className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 shadow-sm"
                        >
                            Save
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className={`absolute top-0 left-0 w-1 h-full rounded-l-lg 
                        ${isHovered || isDragging ? 'bg-indigo-400' : 'bg-gray-200'}`}></div>
                    
                    <div className="flex justify-between w-full">
                        <h3 className="font-medium text-gray-800 pl-2">{title}</h3>
                        
                        <div className={`flex gap-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity 
                            ${isHovered ? 'opacity-100' : ''}`}>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="hover:text-indigo-500 p-1 rounded transition-all duration-200"
                                title="Edit task"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            <button 
                                onClick={() => onDelete(id)}
                                className="hover:text-red-500 p-1 rounded transition-all duration-200"
                                title="Delete task"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-400">
                            {formattedDate}
                        </div>
                        <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                    </div>
                </>
            )}
        </div>
    );
}

function TaskColumn({ id, name, tasks, onAddTask, onDelete, onEdit }) {
    const { setNodeRef } = useSortable({ id });
    const [newTask, setNewTask] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOver, setIsOver] = useState(false);
    
    const handleAddTask = () => {
        if (newTask.trim()) {
            onAddTask(id, newTask);
            setNewTask('');
            setIsExpanded(false);
        }
    };
    
    const columnColors = {
        todo: { 
            bg: 'bg-red-50', 
            border: 'border-red-200', 
            title: 'text-red-700',
            icon: 'bg-red-500',
            hoverBg: 'hover:bg-red-100',
            overBg: 'bg-red-100',
        },
        inProgress: { 
            bg: 'bg-yellow-50', 
            border: 'border-yellow-200', 
            title: 'text-yellow-700',
            icon: 'bg-yellow-500',
            hoverBg: 'hover:bg-yellow-100',
            overBg: 'bg-yellow-100',
        },
        done: { 
            bg: 'bg-green-50', 
            border: 'border-green-200', 
            title: 'text-green-700',
            icon: 'bg-green-500',
            hoverBg: 'hover:bg-green-100',
            overBg: 'bg-green-100',
        },
    };
    
    const { bg, border, title, icon, hoverBg, overBg } = columnColors[id] || 
        { bg: 'bg-gray-50', border: 'border-gray-200', title: 'text-gray-700', icon: 'bg-gray-500', hoverBg: 'hover:bg-gray-100', overBg: 'bg-gray-100' };

    return (
        <div 
            ref={setNodeRef} 
            className={`task-column ${isOver ? overBg : bg} rounded-lg ${border} border ${isOver ? 'shadow-lg' : 'shadow-sm'} flex flex-col transition-colors duration-200`}
            onDragEnter={() => setIsOver(true)}
            onDragLeave={() => setIsOver(false)}
            onDrop={() => setIsOver(false)}
            onDragExit={() => setIsOver(false)}
        >
            <div className={`p-4 flex flex-col h-full`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className={`w-3 h-3 ${icon} rounded-full mr-2`}></div>
                        <h2 className={`font-bold ${title} uppercase tracking-wide text-sm`}>
                            {name}
                        </h2>
                    </div>
                    <span className="text-gray-400 text-sm font-medium bg-white/50 px-2 py-1 rounded-full">{tasks.length}</span>
                </div>
                
                {isExpanded ? (
                    <div className="mb-3 p-2 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100 animate-fadeIn">
                        <input
                            className="border rounded-lg p-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-indigo-300 mb-2"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="What needs to be done?"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                            autoFocus
                        />
                        <div className="flex justify-between">
                            <button 
                                onClick={() => setIsExpanded(false)}
                                className="text-gray-500 px-3 py-1 rounded hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleAddTask} 
                                className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add
                            </button>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsExpanded(true)}
                        className={`${hoverBg} flex items-center justify-center py-2 mb-3 rounded-lg border border-gray-200 text-gray-500 text-sm transition-colors`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Task
                    </button>
                )}
                
                <div className="flex-1 overflow-y-auto max-h-[60vh] pr-1">
                    <SortableContext
                        id={id}
                        items={tasks.map((task) => task.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {tasks.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 italic text-sm">
                                No tasks yet
                            </div>
                        ) : (
                            tasks.map((task) => (
                                <Task
                                    key={task.id}
                                    id={task.id}
                                    title={task.title}
                                    createdAt={task.createdAt}
                                    onDelete={onDelete}
                                    onEdit={onEdit}
                                />
                            ))
                        )}
                    </SortableContext>
                </div>
            </div>
        </div>
    );
}

export default function TaskBoard({ onLoad }) {
    const [tasks, setTasks] = useState(initialTasks);
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState(null);
    const [stats, setStats] = useState({ total: 0, completed: 0 });
    const [activeTask, setActiveTask] = useState(null);
    
    // Create a method object that can be passed to the parent
    const boardMethods = {
        addTask: (columnId, title) => {
            handleAddTask(columnId, title);
        }
    };

    // Use useEffect to pass the methods object to the parent via onLoad
    useEffect(() => {
        if (onLoad && typeof onLoad === 'function') {
            onLoad(boardMethods);
        }
    }, [onLoad]);

    const sensors = useSensors(
        useSensor(PointerSensor, { 
            activationConstraint: { distance: 5 } 
        })
    );

    useEffect(() => {
        fetchTasks();
    }, []);
    
    useEffect(() => {
        if (tasks) {
            const total = Object.values(tasks).reduce((sum, column) => sum + column.tasks.length, 0);
            const completed = tasks.done?.tasks.length || 0;
            setStats({ total, completed });
        }
    }, [tasks]);
    
    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${API_URL}/tasks`);
            if (response.data && Object.keys(response.data).length) {
                setTasks(response.data);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const saveTasks = async () => {
        try {
            setSaveStatus('saving');
            await axios.post(`${API_URL}/tasks`, tasks);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(null), 2000);
        } catch (error) {
            console.error('Error saving tasks:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 2000);
        }
    };
    
    useEffect(() => {
        // Don't save on initial load
        if (!isLoading) {
            const timer = setTimeout(() => {
                saveTasks();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [tasks]);

    const handleDragStart = (event) => {
        const { active } = event;
        // Find the task data for the task being dragged
        for (const columnId in tasks) {
            const task = tasks[columnId].tasks.find(task => task.id === active.id);
            if (task) {
                setActiveTask(task);
                break;
            }
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        
        // Reset the active task when dragging ends
        setActiveTask(null);
        
        if (!over) return;

        // Find source column and index
        let sourceColumn = null;
        let sourceIndex = null;
        for (const columnId in tasks) {
            const index = tasks[columnId].tasks.findIndex((task) => task.id === active.id);
            if (index !== -1) {
                sourceColumn = columnId;
                sourceIndex = index;
                break;
            }
        }

        if (!sourceColumn) return;

        // Find destination column and index
        let destinationColumn = null;
        let destinationIndex = null;

        // First check if the over id is a task
        for (const columnId in tasks) {
            const index = tasks[columnId].tasks.findIndex((task) => task.id === over.id);
            if (index !== -1) {
                destinationColumn = columnId;
                destinationIndex = index;
                break;
            }
        }

        // If not a task, check if it's a column
        if (!destinationColumn && tasks[over.id]) {
            destinationColumn = over.id;
            destinationIndex = tasks[over.id].tasks.length;
        }

        if (!destinationColumn) return;

        const updatedTasks = { ...tasks };

        if (sourceColumn === destinationColumn && destinationIndex !== sourceIndex) {
            // Moving within the same column
            const newTasks = [...tasks[sourceColumn].tasks];
            const [movedTask] = newTasks.splice(sourceIndex, 1);
            newTasks.splice(destinationIndex, 0, movedTask);
            updatedTasks[sourceColumn] = { ...tasks[sourceColumn], tasks: newTasks };
        } else if (sourceColumn !== destinationColumn) {
            // Moving between columns
            const sourceTasks = [...tasks[sourceColumn].tasks];
            const destinationTasks = [...tasks[destinationColumn].tasks];
            const [movedTask] = sourceTasks.splice(sourceIndex, 1);
            destinationTasks.splice(destinationIndex, 0, movedTask);
            updatedTasks[sourceColumn] = { ...tasks[sourceColumn], tasks: sourceTasks };
            updatedTasks[destinationColumn] = { ...tasks[destinationColumn], tasks: destinationTasks };
        }

        setTasks(updatedTasks);
    };

    const handleAddTask = (columnId, title) => {
        const id = uuidv4();
        const updatedTasks = {
            ...tasks,
            [columnId]: {
                ...tasks[columnId],
                tasks: [
                    ...tasks[columnId].tasks, 
                    { 
                        id, 
                        title, 
                        createdAt: new Date().toISOString() 
                    }
                ],
            },
        };
        setTasks(updatedTasks);
    };

    const handleDelete = (taskId) => {
        const updatedTasks = {};
        for (const column in tasks) {
            updatedTasks[column] = {
                ...tasks[column],
                tasks: tasks[column].tasks.filter((task) => task.id !== taskId),
            };
        }
        setTasks(updatedTasks);
    };
    
    const handleEdit = (taskId, newTitle) => {
        const updatedTasks = {};
        for (const column in tasks) {
            updatedTasks[column] = {
                ...tasks[column],
                tasks: tasks[column].tasks.map((task) => 
                    task.id === taskId 
                        ? { ...task, title: newTitle } 
                        : task
                ),
            };
        }
        setTasks(updatedTasks);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading your tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-0">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <div className="flex items-center bg-indigo-50 px-3 py-1 rounded-lg mr-4">
                        <span className="text-indigo-700 font-medium mr-1">{stats.completed}</span>
                        <span className="text-gray-500">of</span>
                        <span className="text-indigo-700 font-medium ml-1">{stats.total}</span>
                        <span className="text-gray-500 ml-1">completed</span>
                    </div>
                    
                    <div className="relative w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full"
                            style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>
                
                <div className="flex items-center">
                    {saveStatus === 'saving' && (
                        <span className="text-gray-500 text-sm mr-2 flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </span>
                    )}
                    {saveStatus === 'saved' && (
                        <span className="text-green-500 text-sm mr-2 flex items-center">
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Saved
                        </span>
                    )}
                    {saveStatus === 'error' && (
                        <span className="text-red-500 text-sm mr-2 flex items-center">
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Failed to save
                        </span>
                    )}
                    <button 
                        onClick={saveTasks} 
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-sm flex items-center transition-all duration-200 transform hover:scale-105"
                    >
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Save Board
                    </button>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(tasks).map(([columnId, { name, tasks: items }]) => (
                        <TaskColumn
                            key={columnId}
                            id={columnId}
                            name={name}
                            tasks={items}
                            onAddTask={handleAddTask}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
                
                {/* Drag overlay to follow the cursor */}
                {activeTask && (
                    <DragOverlay>
                        <DragOverlayItem title={activeTask.title} />
                    </DragOverlay>
                )}
            </DndContext>
        </div>
    );
}