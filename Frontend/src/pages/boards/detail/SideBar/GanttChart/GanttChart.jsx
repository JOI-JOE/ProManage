
import React, { useEffect, useRef, useState } from 'react';
import Gantt from 'frappe-gantt';
import './GanttChart.css';
import { useParams, useNavigate } from 'react-router-dom';
import authClient from '../../../../../api/authClient';

const GanttChart = () => {
    const { boardId } = useParams();
    const navigate = useNavigate();

    const ganttContainer = useRef(null);
    const ganttInstance = useRef(null);
    const [tasks, setTasks] = useState([]);
    const [viewMode, setViewMode] = useState('Day');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchGanttData();
    }, [boardId]);

    useEffect(() => {
        if (tasks.length > 0 && ganttContainer.current) {
            initGantt();
        }
    }, [tasks, viewMode]);

    useEffect(() => {
        if (ganttInstance.current) {
            ganttInstance.current.change_view_mode(viewMode);
        }
    }, [viewMode]);

    const fetchGanttData = async () => {
        try {
            setLoading(true);
            const response = await authClient.get(`/boards/${boardId}/gantt`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            setTasks(response.data);
            setLoading(false);
        } catch (err) {
            setError('Error loading Gantt data');
            setLoading(false);
            console.error('Error fetching gantt data:', err);
        }
    };

    const initGantt = () => {
        if (ganttInstance.current) {
            // ganttInstance.current.refresh(tasks);
        } else {
            ganttInstance.current = new Gantt(ganttContainer.current, tasks, {
                header_height: 50,
                column_width: 30,
                step: 24,
                view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
                bar_height: 30,
                bar_corner_radius: 3,
                arrow_curve: 5,
                padding: 18,
                view_mode: viewMode,
                date_format: 'YYYY-MM-DD',
                custom_popup_html: task => {
                    // Format assignees for display
                    const assignees = task.assignees && task.assignees.length
                        ? `<div class="assignees"><strong>Assignees:</strong> ${task.assignees.join(', ')}</div>`
                        : '';

                    // Format progress for display
                    const progress = `<div class="progress"><strong>Progress:</strong> ${task.progress}%</div>`;

                    // Format description
                    const description = task.description
                        ? `<div class="description"><strong>Description:</strong> ${task.description}</div>`
                        : '';

                    // Sử dụng task.id làm cardId
                    const viewCardLink = `
                        <div class="view-card-link" style="margin-top: 10px; text-align: center;">
                            <a href="#" 
                               onclick="event.stopPropagation(); window.openCardDetail('${task.id}'); return false;"
                               style="display: inline-block; padding: 5px 10px; background-color: #007bff; color: white; 
                                      text-decoration: none; border-radius: 3px; font-weight: bold;">
                                View Card Details
                            </a>
                        </div>`;

                    return `
                        <div class="gantt-task-popup">
                            <h4>${task.name}</h4>
                            <div class="dates">
                                <strong>Start:</strong> ${task.start} 
                                <strong>End:</strong> ${task.end}
                            </div>
                            ${progress}
                            ${assignees}
                            ${description}
                            ${viewCardLink}
                        </div>
                    `;
                },
                on_click: task => {
                    console.log('Task clicked', task);
                    // Sử dụng task.id làm cardId
                    navigateToCard(task.id);
                },
                on_date_change: (task, start, end) => {
                    updateTaskDates(task.id, start, end);
                }
            });

            // Define global function to open card detail from the popup link
            window.openCardDetail = (cardId) => {
                navigateToCard(cardId);
            };
        }
    };

    // Helper function to navigate to card detail
    const navigateToCard = (cardId) => {
        if (!cardId) return;
        
        // Find the task that matches this cardId
        const task = tasks.find(t => t.id === cardId);
        
        if (task && task.boardName) {
            // Use the boardName directly from the task data
            const cardUrl = `/b/${boardId}/${task.boardName}/c/${cardId}`;
            // console.log(`Navigating to: ${cardUrl}`);
            navigate(cardUrl);
        } else {
            // Fallback to the current implementation for cases where we can't find the task or it doesn't have boardName
            const pathSegments = window.location.pathname.split('/');
            let boardName = 'board1'; // Default fallback
            
            for (let i = 0; i < pathSegments.length; i++) {
                if (pathSegments[i] === 'b' && pathSegments[i+1] === boardId && pathSegments[i+2]) {
                    boardName = pathSegments[i+2];
                    break;
                }
            }
            
            const cardUrl = `/b/${boardId}/${boardName}/c/${cardId}`;
            console.log(`Navigating to: ${cardUrl}`);
            navigate(cardUrl);
        }
    };
   
    

    const updateTaskDates = async (taskId, start, end) => {
        try {
            // Format dates consistently to prevent timezone issues
            const formattedStart = formatDateForServer(start);
            const formattedEnd = formatDateForServer(end);
            
            await authClient.post('/gantt/update-task', {
                id: taskId,
                start: formattedStart,
                end: formattedEnd
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            // Update the local state with the same formatted dates
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId
                        ? { ...task, start: formattedStart, end: formattedEnd }
                        : task
                )
            );
        } catch (err) {
            console.error('Error updating task dates:', err);
        }
    };

    const formatDateForServer = (dateStr) => {
        // Create a date object without time components to avoid timezone issues
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    };

    const changeViewMode = (mode) => {
        setViewMode(mode);
    };

    if (loading) return <div className="gantt-loading">Loading Gantt chart...</div>;
    if (error) return <div className="gantt-error">{error}</div>;
    if (tasks.length === 0) return <div className="gantt-empty">No tasks with dates available for Gantt view</div>;

    return (
        <div className="gantt-wrapper">
            <div className="gantt-controls">
                <div className="view-modes">
                    <button
                        className={viewMode === 'Day' ? 'active' : ''}
                        onClick={() => changeViewMode('Day')}
                    >
                        Day
                    </button>
                    <button
                        className={viewMode === 'Week' ? 'active' : ''}
                        onClick={() => changeViewMode('Week')}
                    >
                        Week
                    </button>
                    <button
                        className={viewMode === 'Month' ? 'active' : ''}
                        onClick={() => changeViewMode('Month')}
                    >
                        Month
                    </button>
                </div>

                <div className="gantt-legend">
                    <span className="legend-item">
                        <span className="legend-color completed" />Thẻ đã hoàn thành
                    </span>
                    <span className="legend-item">
                        <span className="legend-color inprogress" /> Thẻ có danh sách công việc
                    </span>
                    <span className="legend-item">
                        <span className="legend-color notstarted" /> Thẻ chưa hoàn thành
                    </span>
                </div>
            </div>
            <div className="gantt-container" ref={ganttContainer}></div>
        </div>
    );
};

export default GanttChart;
