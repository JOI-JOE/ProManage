// components/EventCard.jsx
import { Check, Square } from '@mui/icons-material';
import React, { useState } from 'react';
import { useToggleCardCompletion } from '../../../../../hooks/useCard';
const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  return (
    new Date(date1).getFullYear() === new Date(date2).getFullYear() &&
    new Date(date1).getMonth() === new Date(date2).getMonth() &&
    new Date(date1).getDate() === new Date(date2).getDate()
  );
};
const EventCard = ({ title, labels = [], members = [], isCompleted = false,onToggleComplete,eventStart, currentDate }) => {
  // const { mutate: toggleCompletion } = useToggleCardCompletion();
  const [completed, setCompleted] = useState(isCompleted);
  const [hovered, setHovered] = useState(false);
  const isFirstDay = isSameDay(eventStart, currentDate);
  const handleToggle = (e) => {
    e.stopPropagation(); 
    const newStatus = !completed;
    setCompleted(newStatus);
    // TODO: Gọi mutation API ở đây nếu cần
    // updateCardStatus(...);
    if (onToggleComplete) {
      onToggleComplete(newStatus); // Gọi callback nếu có
    }
  };
  const handleMouseEnter = () => {
    if (isFirstDay) {
      setHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };
  const shouldShowCheck = (hovered || completed) && isFirstDay;

  // const [completed, setCompleted] = useState(isCompleted);
  return (
    <div
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
      style={{
        background: '#ffffff',
        borderRadius: '8px',
        padding: '8px',
        width: '100%',
        position: 'relative',
        paddingLeft: shouldShowCheck ? '24px' : '0px', // Chừa chỗ cho nút check
        transition: 'padding 0.2s ease',
      }}>
      {shouldShowCheck && (
        <div
        onClick={(e) => handleToggle(e)}
          title="Đánh dấu hoàn tất"
          style={{
            position: 'absolute',
            left: '8px',
            top: '10px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: `2px solid ${completed ? '#4caf50' : '#ccc'}`,
            backgroundColor: completed ? '#4caf50' : 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {completed && <Check size={10} color="white" />}
        </div>
      )}

      {/* Title */}
      <div
        style={{
          fontWeight: 600,
          fontSize: '13px',
          marginBottom: '4px',
          color: completed ? '#999' : '#333',
          // textDecoration: completed ? 'line-through' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        {title}
      </div>


      <div style={{ marginBottom: '4px' }}>
        {labels.map((label, idx) => (
          <span key={idx} style={{
            backgroundColor: label.color_code,
            color: 'white',
            padding: '2px 8px',
            fontSize: '10px',
            borderRadius: '12px',
            margin: '2px 4px 2px 0',
            display: 'inline-block'
          }}>
            {label.label_title}
          </span>
        ))}
      </div>

      <div>
        {members.map((member, idx) => {
          const lastInitial = member.full_name.trim().split(' ').pop()[0].toUpperCase();
          return (
            <span key={idx} style={{
              display: 'inline-block',
              width: '24px',
              height: '24px',
              background: '#00bcd4',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '12px',
              borderRadius: '50%',
              margin: '2px 4px 0 0',
              textAlign: 'center',
              lineHeight: '24px'
            }}>
              {lastInitial}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default EventCard;
