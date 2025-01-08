import {FormData} from "../../types";
import dayjs from "dayjs";
import {Button, Space, TimePicker, Tooltip} from "antd";
import {PiSpinnerBall} from "react-icons/pi";

export function TimeInput({formData, setFormData, convertFromNotionTime, convertToNotionTime}: {
    formData: FormData,
    setFormData: (data: FormData | ((prev: FormData) => FormData)) => void,
    convertFromNotionTime: (time: string) => dayjs.Dayjs,
    convertToNotionTime: (time: dayjs.Dayjs) => string
}) {
    return (
        <Space size={0}>
            <TimePicker
                rootClassName="rounded-r-none border-r-0"
                value={convertFromNotionTime(formData.timestamp)}
                format="HH:mm"
                onChange={(time) => {
                    if (time) {
                        setFormData(prev => ({
                            ...prev,
                            timestamp: convertToNotionTime(time)
                        }));
                    }
                }}
                showNow
                className="w-24"
            />
            <Tooltip title="Jetzt">
                <Button
                    rootClassName="rounded-l-none"
                    onClick={() => {
                        const now = dayjs();
                        setFormData(prev => ({
                            ...prev,
                            timestamp: convertToNotionTime(now)
                        }));
                    }}
                    icon={<PiSpinnerBall/>}
                />
            </Tooltip>
        </Space>
    );
}