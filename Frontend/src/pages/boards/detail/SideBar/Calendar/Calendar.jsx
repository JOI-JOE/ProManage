import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Box } from "@mui/material";
import "./Calendar.css"; // Import custom CSS
import MenuCalendar from "./MenuCalendar/MenuCalendar";
import { bg } from "date-fns/locale";

const Calendar = () => {
  const [calendarEvents, setCalendarEvents] = useState([]);

  return (
    <Box
      sx={{
        padding: "32px",
        height: (theme) =>
          `calc( ${theme.trello.boardContentHeight} + ${theme.trello.boardBarHeight} )`, // Adjust height to match the sidebar
        overflow: "auto", // Ensure overflow is handled
        fontSize: "0.7rem",
      }}
    >
      <MenuCalendar
        sx={{
          bgcolor: "background.paper",
        }}
      />
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
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
    </Box>
  );
};

export default Calendar;
