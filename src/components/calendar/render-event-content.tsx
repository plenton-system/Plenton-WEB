import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function renderEventContent(eventInfo: any) {

    const {
        description,
        categoryColor,
        responsibleName,
        responsibleAvatar
    } = eventInfo.event.extendedProps || {};

    return (
        <Tooltip
            arrow
            placement="top"
            slotProps={{
                popper: {
                    sx: { zIndex: 20000 },
                    modifiers: [
                        { name: 'offset', options: { offset: [0, 8] } },
                    ],
                },
            }}
            title={
                <Box sx={{ p: 0.5, minWidth: 180 }}>
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                            color: 'primary.main',
                            fontSize: 20,
                            mb: 0.5,
                            textAlign: 'center',
                            letterSpacing: 2,
                        }}
                    >
                        {eventInfo.timeText}
                    </Typography>
                    <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ fontSize: 16, textAlign: 'center' }}
                    >
                        {eventInfo.event.title}
                    </Typography>
                    {description && (
                        <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'center' }}>
                            {description}
                        </Typography>
                    )}
                    {responsibleName && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, justifyContent: 'center' }}>
                            <Avatar
                                src={responsibleAvatar}
                                sx={{ width: 24, height: 24, mr: 1 }}
                            />
                            <Typography variant="caption">{responsibleName}</Typography>
                        </Box>
                    )}
                </Box>
            }
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    width: '100%',
                    minWidth: 0,
                    overflow: 'hidden',
                }}
            >
                {categoryColor && (
                    <Box
                        sx={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            bgcolor: categoryColor,
                            flexShrink: 0,
                        }}
                    />
                )}
                {eventInfo.timeText && (
                    <Typography
                        variant="caption"
                        fontWeight={600}
                        sx={{
                            mr: 0.5,
                            fontSize: 12,
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                        }}
                    >
                        {eventInfo.timeText}
                    </Typography>
                )}
                <Typography
                    variant="caption"
                    fontWeight={500}
                    noWrap
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flexGrow: 1,
                        fontSize: 13,
                        lineHeight: 1.2,
                        minWidth: 0,
                    }}
                >
                    {eventInfo.event.title}
                </Typography>
            </Box>
        </Tooltip>
    );
}
