// components/EventCard.jsx
import React from 'react';

const EventCard = ({ title, labels = [], members = [] }) => {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '8px',
      padding: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      borderLeft: `4px solid ${labels[0]?.color_code || "#2196F3"}`
    }}>
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px', color: '#333' }}>
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
