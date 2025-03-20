import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Box } from "@mui/material";
import "./Calendar.css"; // Import custom CSS
import MenuCalendar from "./MenuCalendar/MenuCalendar";

const Calendar = () => {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenuCalendar = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <Box
      sx={{
        padding: "32px",
        height: (theme) =>
          `calc( ${theme.trello.boardContentHeight} + ${theme.trello.boardBarHeight} )`, // Adjust height to match the sidebar
        overflow: "auto", // Ensure overflow is handled
        fontSize: "0.7rem",
        position: "relative", // Ensure the menu is positioned correctly
      }}
    >
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        customButtons={{
          menuButton: {
            text: "☰", // Biểu tượng menu hoặc thay bằng text khác
            click: toggleMenuCalendar,
          },
        }}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,menuButton", // Thêm Menu vào đây
        }}
        buttonText={{
          today: "Today",
          month: "Month",
          week: "Week",
          day: "Day",
        }}
        // events={calendarEvents}
        // dateClick={(info) => {
        //   const newEvent = {
        //     title: "New Event",
        //     start: info.dateStr,
        //     allDay: true,
        //   };
        //   setCalendarEvents([...calendarEvents, newEvent]);
        // }}
      />
      <MenuCalendar open={menuOpen} onClose={toggleMenuCalendar} />
    </Box>
  );
};

export default Calendar;
