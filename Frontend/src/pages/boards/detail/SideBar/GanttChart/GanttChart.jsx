import React, { useEffect, useRef, useState } from 'react';
import Gantt from 'frappe-gantt';
import './GanttChart.css';
import { useParams } from 'react-router-dom';
import authClient from '../../../../../api/authClient';


const GanttChart = () => {
    const { boardId } = useParams();

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
                </div>
            `;
                },
                on_click: task => {
                    console.log('Task clicked', task);
                    // Thêm xử lý để mở card tương ứng trong ứng dụng
                },
                on_date_change: (task, start, end) => {
                    // console.log('Task date changed', task, start, end);
                    updateTaskDates(task.id, start, end);
                }

                // on_progress_change: (task, progress) => {
                // console.log('Task progress changed', task, progress);
                // // Thêm xử lý để cập nhật tiến độ
                // }
            });
        }
    };

    const updateTaskDates = async (taskId, start, end) => {
        try {
            await authClient.post('/gantt/update-task', {
                id: taskId,
                start: start,
                end: end
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            // Cập nhật lại state tasks
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId
                        ? { ...task, start: start, end: end }
                        : task
                )
            );
        } catch (err) {
            console.error('Error updating task dates:', err);
            // Có thể hiển thị thông báo lỗi
        }
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
                {/* <button className="refresh-btn" onClick={fetchGanttData}>
            Refresh
            </button> */}

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