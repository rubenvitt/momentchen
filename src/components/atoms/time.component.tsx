import { Space, Typography } from "antd";
import dayjs from "dayjs";
import { PiClock } from "react-icons/pi";

const {Text} = Typography;

export function TimeDisplay({notionTime, convertFromNotionTime}: { notionTime: string, convertFromNotionTime: (time: string) => dayjs.Dayjs }) {
    const localTime = convertFromNotionTime(notionTime);
    return (
        <Space size="small" className="text-gray-500 dark:text-gray-400 flex items-center">
            <PiClock className="text-gray-400 dark:text-gray-500" />
            <Text type="secondary" className="m-0">
                {localTime.format('HH:mm')}
            </Text>
        </Space>
    );
}