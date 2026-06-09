import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatDate = (date) => dayjs(date).format('MMM D, YYYY');
export const formatDateTime = (date) => dayjs(date).format('MMM D, YYYY h:mm A');
export const formatRelative = (date) => dayjs(date).fromNow();
export const formatISO = (date) => dayjs(date).format('YYYY-MM-DD');
