import React, { useState, useEffect } from 'react'
import TaskBoard from './components/TaskBoard'
import './App.css'

const App = () => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTask, setQuickTask] = useState('');
  const [taskBoardComponent, setTaskBoardComponent] = useState(null);

  const handleQuickAdd = () => {
    if (quickTask.trim() && taskBoardComponent) {
      // Trigger the task board's addTask method
      taskBoardComponent.addTask('todo', quickTask.trim());
      setQuickTask('');
      setShowQuickAdd(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
      <header className="bg-white shadow-lg p-4 mb-6 border-b border-indigo-100">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-indigo-600">TaskFlow</h1>
          </div>
          <div className="flex items-center relative">
            <span className="text-indigo-500 mr-4 hidden md:block">Organize your workflow efficiently</span>
            {showQuickAdd ? (
              <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-lg p-3 z-50 min-w-[300px] animate-fadeIn">
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={quickTask}
                    onChange={(e) => setQuickTask(e.target.value)}
                    placeholder="Enter task title"
                    className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setShowQuickAdd(false)} 
                      className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded">
                      Cancel
                    </button>
                    <button 
                      onClick={handleQuickAdd} 
                      className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowQuickAdd(true)} 
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow transition-all duration-200 transform hover:scale-105">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Quick Add
                </span>
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 pb-12">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">My Task Board</h2>
              <p className="text-gray-500 mt-1">Manage and organize your tasks with ease</p>
            </div>
            <div className="flex mt-4 sm:mt-0">
              <div className="flex items-center text-gray-600 mr-6">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm">To Do</span>
              </div>
              <div className="flex items-center text-gray-600 mr-6">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm">In Progress</span>
              </div>
              <div className="flex items-center text-gray-600">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm">Done</span>
              </div>
            </div>
          </div>
          <TaskBoard 
            onLoad={(component) => setTaskBoardComponent(component)}
          />
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-gray-500 text-sm">
        TaskFlow - Organize your tasks efficiently
      </footer>
    </div>
  )
}
  
export default App