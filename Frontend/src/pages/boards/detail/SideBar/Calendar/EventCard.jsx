// components/EventCard.jsx
import { Check } from '@mui/icons-material';
import React, { useState } from 'react';

const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  return (
    new Date(date1).getFullYear() === new Date(date2).getFullYear() &&
    new Date(date1).getMonth() === new Date(date2).getMonth() &&
    new Date(date1).getDate() === new Date(date2).getDate()
  );
};

const EventCard = ({ title, labels = [], members = [], isCompleted = false, onToggleComplete, eventStart, currentDate }) => {
  const [completed, setCompleted] = useState(isCompleted);
  const [hovered, setHovered] = useState(false);
  const isFirstDay = isSameDay(eventStart, currentDate);
  // console.log(currentDate);
  console.log(isFirstDay);
  const shouldShowCheck = (hovered || completed) && isFirstDay;

  const handleToggle = (e) => {
    e.stopPropagation();
    const newStatus = !completed;
    setCompleted(newStatus);
    if (onToggleComplete) {
      onToggleComplete(newStatus);
    }
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        background: 'white',
        padding: '4px', // Giảm padding tổng thể
        width: '100%',
        height: '100%',
        position: 'relative', 
        paddingLeft: shouldShowCheck ? '24px' : '4px', // Điều chỉnh padding trái khi có checkbox
        transition: 'padding 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        // boxShadow: '0 1px 0 rgba(9,30,66,.25)',
      }}
    >
      {shouldShowCheck && (
        <div
          onClick={(e) => handleToggle(e)}
          title="Đánh dấu hoàn tất"
          style={{
            position: 'absolute',
            left: '4px', // Giảm vị trí left của checkbox
            top: '4px', // Giảm vị trí top của checkbox
            width: '14px', // Giảm kích thước checkbox
            height: '14px', // Giảm kích thước checkbox
            borderRadius: '3px',
            border: `1px solid ${completed ? '#61bd4f' : '#ccc'}`,
            backgroundColor: completed ? '#61bd4f' : 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {completed && <Check size={8} color="white" />} {/* Giảm kích thước icon check */}
        </div>
      )}

      {/* Title */}
      <div
        style={{
          fontWeight: 400,
          fontSize: '12px', // Giảm kích thước font chữ của title
          color: '#172b4d',
          transition: 'all 0.2s ease',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginBottom: '2px', // Giảm margin bottom của title
        }}
      >
        {title}
      </div>

      {/* Labels */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px', marginBottom: '2px' }}>
        {labels.map((label, idx) => (
          <span key={idx} style={{
            backgroundColor: label.color_code,
            color: 'white',
            height: 'auto',
            padding: '1px 6px', // Giảm padding của label
            fontSize: '9px', // Giảm kích thước font chữ của label
            borderRadius: '3px',
            marginRight: '1px',
            marginBottom: '1px',
            display: 'inline-block',
          }}>{label.label_title}</span>
        ))}
      </div>

      {/* Members */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
        {members.slice(0, 2).map((member, idx) => { // Giảm số lượng avatar hiển thị ban đầu
          const lastInitial = member.full_name.trim().split(' ').pop()[0].toUpperCase();
          return (
            <span key={idx} style={{
              display: 'inline-block',
              width: '16px', // Giảm kích thước avatar
              height: '16px', // Giảm kích thước avatar
              background: '#cddc39',
              color: '#172b4d',
              fontWeight: 'bold',
              fontSize: '8px', // Giảm kích thước font chữ avatar
              borderRadius: '50%',
              textAlign: 'center',
              lineHeight: '16px',
              marginLeft: '1px', // Giảm margin left của avatar
            }}>{lastInitial}</span>
          );
        })}
        {members.length > 2 && (
          <span style={{
            display: 'inline-block',
            width: '16px', // Giảm kích thước số lượng còn lại
            height: '16px', // Giảm kích thước số lượng còn lại
            background: 'rgba(9,30,66,.08)',
            color: '#172b4d',
            fontSize: '8px', // Giảm kích thước font chữ số lượng còn lại
            borderRadius: '50%',
            textAlign: 'center',
            lineHeight: '16px',
            marginLeft: '1px',
          }}>+{members.length - 2}</span> 
        )}
      </div>
    </div>
  );
};

export default EventCard;