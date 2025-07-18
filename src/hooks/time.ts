// Custom hooks
import {useCallback, useEffect, useState} from "react";
import dayjs from "dayjs";

export const useCurrentTime = () => {
    const [currentTime, setCurrentTime] = useState(dayjs());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(dayjs());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return currentTime;
};
export const useTimeConversion = () => {
    const convertToNotionTime = useCallback((localTime: dayjs.Dayjs) => {
        return localTime.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    }, []);

    const convertFromNotionTime = useCallback((notionTime: string) => {
        return dayjs.utc(notionTime).local();
    }, []);

    return {convertToNotionTime, convertFromNotionTime};
};