import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Box } from "@mui/material";
import "./Calendar.css"; // Import custom CSS
import MenuCalendar from "./MenuCalendar/MenuCalendar";
import { useParams } from "react-router-dom";
import { useGetWorkspaceByName } from "../../../../../hooks/useWorkspace";
import { useCalendar, useUpdateCardCalendar } from "../../../../../hooks/useCalendar";
import ReactDOM from 'react-dom/client';
import EventCard from "./EventCard";
import { toast } from "react-toastify";


const Calendar = () => {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cardEvents, setCardEvents] = useState([]);

  const { workspaceName } = useParams();
  const { data: data, isLoading, error } = useGetWorkspaceByName(workspaceName);
  const boardIds = data?.boards?.map(board => board.id);
  const calendarRef = useRef(null);
  const toggleMenuCalendar = () => {
    setMenuOpen(!menuOpen);
  };

  const handleDatesSet = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const currentDate = calendarApi.getDate();
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      setCurrentMonth(`${year}-${month}`);
    }
  };
  const { data: cardcaledar = [] } = useCalendar(boardIds, currentMonth);
  const { mutate: updateEndDate } = useUpdateCardCalendar();
  console.log(cardcaledar);
  useEffect(() => {
    if (cardcaledar) {
      const mapped = cardcaledar.map(card => ({
        id: card.id,
        title: card.title,
        start: card.start,
        extendedProps: {
          labels: card.labels,
          members: card.members,
          board_id: card.board_id
        }
      }));
      setCardEvents(mapped);
    }
  }, [cardcaledar]);
  const handleFilterChange = (filters) => {
    console.log("Lọc mới:", filters);

    // Gọi API hoặc lọc dữ liệu tại đây
  };

  const handleEventDrop = (info) => {
    const updatedEventId = info.event.id;
    const newStartDate = info.event.startStr;
    const boardIdOfCard = info.event.extendedProps.board_id;

    setCardEvents(prev =>
      prev.map(ev =>
        ev.id === updatedEventId ? { ...ev, start: newStartDate } : ev
      )
    );

    // Tách phần ngày nếu bạn chỉ lưu end_date dưới dạng YYYY-MM-DD


    // Gọi API cập nhật ngày mới (tuỳ backend, dùng fetch/axios/mutation đều được)
    // console.log(`Sự kiện ${updatedEventId} được kéo sang ngày mới: ${newStartDate}`);
    updateEndDate({ cardId: updatedEventId, board_id: boardIdOfCard, end_date: newStartDate, month: currentMonth },
     {
      onError: (error) => {
        // ⚠️ Nếu backend trả lỗi, gọi revert() để quay lại vị trí cũ
        info.revert();

        // Hiển thị lỗi ra UI nếu cần
        toast.error(error.response?.data?.message || "Cập nhật thất bại");
    },
     }


    

    );

    // TODO: Gọi hàm cập nhật database tại đây
    // Ví dụ: updateCalendarDate(updatedEventId, newStartDate)
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
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        editable={true}
        datesSet={handleDatesSet}
        customButtons={{
          menuButton: {
            text: "☰",
            click: toggleMenuCalendar,
          },
        }}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,menuButton",
        }}
        buttonText={{
          today: "Today",
          month: "Month",
          week: "Week",
          day: "Day",
        }}
        events={cardEvents}
        eventDidMount={(info) => {
          const labels = info.event.extendedProps.labels || [];
          const members = info.event.extendedProps.members || [];
          const title = info.event.title;

          const titleEl = info.el.querySelector(".fc-event-title");
          if (titleEl) {
            const root = ReactDOM.createRoot(titleEl);
            root.render(<EventCard title={title} labels={labels} members={members} />);
          }

          // Xoá style mặc định
          info.el.style.backgroundColor = "transparent";
          info.el.style.border = "none";
          info.el.style.padding = "0";
        }}
        eventDrop={handleEventDrop}

      />

      <MenuCalendar open={menuOpen} onClose={toggleMenuCalendar} onFilterChange={handleFilterChange} />
    </Box>
  );
};

export default Calendar;
