import {SelectOption} from "../../types";
import {Space, Tag} from "antd";
import {getNotionColor} from "../../helper";

export function MomentTypeSelector({types, selectedType, onTypeSelect}: {
    types: SelectOption[],
    selectedType: string,
    onTypeSelect: (type: string) => void
}) {
    return (
        <Space wrap size={[0, 8]}>
            {types.map(type => (
                <Tag
                    key={type.id}
                    color={selectedType === type.name ? getNotionColor(type.color) : 'default'}
                    className="cursor-pointer select-none m-1"
                    onClick={() => onTypeSelect(type.name)}
                >
                    {type.name}
                </Tag>
            ))}
        </Space>
    );
}