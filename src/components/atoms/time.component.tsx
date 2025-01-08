import dayjs from "dayjs";
import {Space, Typography} from "antd";
import {PiClock} from "react-icons/pi";

const {Text} = Typography;

export function TimeDisplay({notionTime, convertFromNotionTime}: { notionTime: string, convertFromNotionTime: (time: string) => dayjs.Dayjs }) {
    const localTime = convertFromNotionTime(notionTime);
    return (
        <Space size="small">
            <PiClock className="text-gray-400"/>
            <Text type="secondary">
                {localTime.format('HH:mm')}
            </Text>
        </Space>
    );
}