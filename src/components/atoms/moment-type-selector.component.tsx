import {Radio} from "antd";
import {SelectOption} from "../../types";
import {getNotionBackgroundColor, getNotionForegroundColor} from "../../helper";

export function MomentTypeSelector({types, selectedType, onTypeSelect}: {
    types: SelectOption[],
    selectedType: string,
    onTypeSelect: (type: string) => void
}) {
    return (
        <Radio.Group
            value={selectedType}
            onChange={(e) => onTypeSelect(e.target.value)}
        >
            {types.map((type) => (
                <Radio.Button
                    key={type.id}
                    value={type.name}
                    style={{
                        color: selectedType === type.name ? getNotionForegroundColor(type.color) : undefined,
                        backgroundColor: selectedType === type.name ? getNotionBackgroundColor(type.color) : undefined,
                    }}
                >
                    {type.name}
                </Radio.Button>
            ))}
        </Radio.Group>
    );
}