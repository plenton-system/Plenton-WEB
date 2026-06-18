import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import esLocale from '@fullcalendar/core/locales/es';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

import Box from '@mui/material/Box';

import { renderEventContent } from './render-event-content';
import { CalendarSkeleton } from './components/calendar-skeleton';

import type { CalendarProps } from './types';

// ----------------------------------------------------------------------

export function Calendar({
    events,
    loading,
    onAddEvent,
    onEditEvent,
    onMonthChange,
    onDragDropEvent,
    color = 'var(--palette-primary-main)'
}: CalendarProps) {
    const { t, i18n } = useTranslation();
    const lastRange = useRef<{ start: string, end: string } | null>(null);
    const calendarLocale = i18n.resolvedLanguage === 'es'
        ? 'es'
        : i18n.resolvedLanguage === 'pt-BR'
            ? 'pt-br'
            : 'en';

    const handleDateClick = (arg: any) => {
        onAddEvent?.(arg.dateStr);
    };

    const handleEventClick = (info: any) => {
        onEditEvent?.(info.event.id);
    };

    const handleEventDrop = (info: any) => {
        onDragDropEvent?.(info.event.id, info.event.start, info.event.end);
    };

    const handleDatesSet = (arg: any) => {
        const startIso = arg.start.toISOString();
        const endIso = arg.end.toISOString();

        if (
            !lastRange.current ||
            lastRange.current.start !== startIso ||
            lastRange.current.end !== endIso
        ) {
            lastRange.current = { start: startIso, end: endIso };
            onMonthChange?.(arg.start, arg.end);
        }
    };

    return (
        <Box sx={{ position: 'relative' }}>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                locales={[ptBrLocale, esLocale]}
                locale={calendarLocale}
                editable
                selectable
                dayMaxEvents={5}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                height="calc(100vh - 90px)"
                eventColor={color}
                datesSet={handleDatesSet}
                eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit'
                }}
                eventContent={renderEventContent}
                headerToolbar={{
                    left: 'prev today',
                    center: 'title',
                    right: 'timeGridDay,timeGridWeek,dayGridMonth next'
                }}
                buttonText={{
                    today: t('calendar.today'),
                    month: t('calendar.month'),
                    week: t('calendar.week'),
                    day: t('calendar.day')
                }}
            />

            {loading && <CalendarSkeleton />}
        </Box>
    );
}
