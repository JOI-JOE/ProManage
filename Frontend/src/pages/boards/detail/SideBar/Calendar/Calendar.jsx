import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Box } from "@mui/material";
import "./Calendar.css";
import MenuCalendar from "./MenuCalendar/MenuCalendar";
import { useNavigate, useParams } from "react-router-dom";
import { useGetWorkspaceById, useGetWorkspaceByName } from "../../../../../hooks/useWorkspace";
import { useCalendar, useUpdateCardCalendar } from "../../../../../hooks/useCalendar";
import ReactDOM from 'react-dom/client';
import EventCard from "./EventCard";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import viLocale from '@fullcalendar/core/locales/vi';
import { useQueryClient } from "@tanstack/react-query";
import { useToggleCardCompletion } from "../../../../../hooks/useCard";

import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);



const Calendar = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [visibleMonths, setVisibleMonths] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cardEvents, setCardEvents] = useState([]);
  const { mutate: toggleCardCompletion } = useToggleCardCompletion();
 const { workspaceId } = useParams();
    // const { data, isLoading, error } = useGetWorkspaceByName(workspaceName);
    const {
        data: workspace,
        isLoading: isLoadingWorkspace,
        isError: isWorkspaceError,
        error: workspaceError,
        refetch: refetchWorkspace,
    } = useGetWorkspaceById(workspaceId, {
        enabled: !!workspaceId,
    });
console.log(workspace);

const boardIds = workspace?.boards
  ?.filter(board => !board.closed)
  .map(board => board.id);

  // console.log(boardIds);

  // console.log(dateRange);


  const calendarRef = useRef(null);
  
  const { data: cardcaledar = [], refetch } = useCalendar(boardIds, dateRange.start, dateRange.end);
 
  const { mutate: updateEndDate } = useUpdateCardCalendar();
  

  const handleDatesSet = (arg) => {
    const start = dayjs(arg.start).format("YYYY-MM-DD");
    const end = dayjs(arg.end).format("YYYY-MM-DD");
    // const calendarApi = calendarRef.current?.getApi();
    // if (calendarApi) {
    //   const currentDate = calendarApi.getDate();
    //   const year = currentDate.getFullYear();
    //   const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    //   setCurrentMonth(`${year}-${month}`);

    // }
    setDateRange({ start, end });
  };
  const getMonthsBetween = (start, end) => {
    const result = [];
    let current = dayjs(start).startOf("month");
    const last = dayjs(end).startOf("month");

    while (current.isSameOrBefore(last)) {
      result.push(current.format("YYYY-MM"));
      current = current.add(1, "month");
    }
    return result;
  };
  // console.log(getMonthsBetween("2025-03-28", "2025-06-02"));
  // 🧪 Kết quả: ["2025-03", "2025-04", "2025-05", "2025-06"]



  // Ánh xạ dữ liệu sự kiện từ API
  // import thêm dayjs


  useEffect(() => {
    if (cardcaledar) {
      const mapped = cardcaledar.map(card => {

        const isAllDay =
          card.start && !card.start.includes("T") &&
          card.end && !card.end.includes("T");

        // Nếu là all-day thì cộng thêm 1 ngày cho end vì fullCalendar chỉ hiển thị đến ngày kế ngày kết thúc
        const adjustedEnd = isAllDay && card.end
          ? dayjs(card.end).add(1, "day").format("YYYY-MM-DD")
          : card.end;

        return {
          id: card.id,
          title: card.title,
          start: card.start,
          end: adjustedEnd,
          allDay: isAllDay, // BẮT BUỘC PHẢI THÊM NÀY
          extendedProps: {
            labels: card.labels,
            members: card.members,
            board_id: card.board_id,
            board_name: card.board_name,
            is_completed: card.is_completed // ✅ thêm dòng này
          }
        };
      });
      // console.log("🧩 Mapped events gửi vào FullCalendar:", mapped);
      setCardEvents(mapped);
    }
  }, [cardcaledar]);





  // Cập nhật UI khi kéo thả sự kiện
  const handleEventChange = (info) => {
    const updatedEventId = info.event.id;// lấy id từ event
    const originalStartDate = info.oldEvent.startStr; // Ngày ban đầu trước khi kéo
    const newStartDate = info.event.startStr;
    const rawEndDate = info.event.endStr || newStartDate;
    const newEndDate = dayjs(rawEndDate).subtract(1, "day").format("YYYY-MM-DD");
    updateEndDate(
      { cardId: updatedEventId, start_date: newStartDate, end_date: newEndDate },
      {
        onSuccess: () => {
          // refetch();

          // Invalidate query dựa trên dateRange.start và dateRange.end
          queryClient.invalidateQueries({ 
            queryKey: ["calendar", boardIds, dateRange.start, dateRange.end] 
          });
        },
        onError: (error) => {
          info.revert(); // Quay lại vị trí cũ nếu lỗi
          toast.error(error.response?.data?.message || "Cập nhật thất bại");
        },
      }
    );
  };

  const handleToggleComplete = (info) => {
    const cardId = info.event.id;
    const startDate = info.event.startStr; // Ngày bắt đầu của sự kiện
    const endDate = info.event.endStr || startDate; // Ngày kết thúc (nếu không có thì dùng ngày bắt đầu)
    toggleCardCompletion(
      cardId,
      {
        onSuccess: () => {
          const months = getMonthsBetween(startDate, endDate); // Lấy tất cả các tháng mà sự kiện kéo dài qua
          queryClient.invalidateQueries({ queryKey: ["calendar", boardIds, months] });
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || "Không thể cập nhật hoàn thành");
        }
      }
    );
  };

  const handleFilterChange = (filters) => {
    console.log("Lọc mới:", filters);
    // TODO: xử lý lọc sự kiện nếu cần
  };

  return (
    <Box
      sx={{
        padding: "32px",
        height: (theme) =>
          `calc( ${theme.trello.boardContentHeight} + ${theme.trello.boardBarHeight} )`,
        overflow: "auto",
        fontSize: "0.7rem",
        position: "relative",
      }}
    >
      <FullCalendar
        ref={calendarRef}
        locale={viLocale}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        editable={true}
        datesSet={handleDatesSet}
        // ✅ Thêm thuộc tính displayEventTime
        displayEventTime={false}
        views={{
          timeGridWeek: {
            slotLabelFormat: { hour: undefined, minute: undefined },
            eventTimeFormat: { hour: undefined, minute: undefined }
          },
          timeGridDay: {
            slotLabelFormat: { hour: undefined, minute: undefined },
            eventTimeFormat: { hour: undefined, minute: undefined }
          }
        }}

        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,menuButton",
        }}
        buttonText={{
          today: "Ngày",
          month: "Tháng",
          week: "Tuần",
          day: "Ngày",
        }}
        eventClick={(info) => {
          const cardId = info.event.id; // ID card là event.id
          const boardId = info.event.extendedProps.board_id;
          const boardName = info.event.extendedProps.board_name;
          // console.log(boardName);
          navigate(`/b/${boardId}/${boardName}/c/${cardId}`);
        }}
        events={cardEvents}
        eventDrop={handleEventChange}
        eventResize={handleEventChange}
        eventDidMount={(info) => {
          const { labels = [], members = [], is_completed } = info.event.extendedProps;
          const titleEl = info.el.querySelector(".fc-event-title");
          if (titleEl) {
            const root = ReactDOM.createRoot(titleEl);
            root.render(<EventCard title={info.event.title}
              labels={labels}
              members={members}
              isCompleted={is_completed} // ✅ truyền vào
              onToggleComplete={() => handleToggleComplete(info)} // ⬅️ thêm hàm xử lý toggle
              eventStart={info.event.start}
              currentDate={info.el.closest('.fc-daygrid-day')?.getAttribute('data-date') || arg.event.start}


            />);
          }
          Object.assign(info.el.style, {
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "6px",
            padding: "4px 6px",
            overflow: "hidden",
            height: '100% !important',
            display: 'flex !important',
            flexDirection: 'column',
            position: 'relative', // Đảm bảo phần tử cha là relative
          });

          // Thêm khoảng cách giữa các event trong cùng 1 ngày
          const harness = info.el.closest(".fc-daygrid-event-harness");
          if (harness) {
            harness.style.height = "auto !important"; // Để harness ôm vừa content
            harness.style.overflow = "visible !important"; // Hiển thị toàn bộ content
            harness.style.marginBottom = "50px"; // tăng nếu muốn cách rộng hơn
          }
        }}

      />

      {/* <MenuCalendar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onFilterChange={handleFilterChange}
      /> */}
    </Box>
  );
};

export default Calendar;
