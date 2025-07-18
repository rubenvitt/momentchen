import { Col, Row, Select } from "antd";
import { ReactElement } from "react";
import { FormData, LifeAreaItem, ProjectItem, QueryResult } from "../../types";

interface OptionType {
    label: ReactElement;
    value: string;
    searchText: string;
    rawId: string;
    isProject: boolean;
}

export function CategorySelector({
                                     formData,
                                     projectsQuery,
                                     lifeAreasQuery,
                                     onChange
                                 }: {
    formData: FormData,
    projectsQuery: QueryResult<ProjectItem>,
    lifeAreasQuery: QueryResult<LifeAreaItem>,
    onChange: (isProject: boolean, category: string) => void
}) {
    // Create flat options array with all items
    const allOptions: OptionType[] = [
        ...(projectsQuery.data || []).map((item: { id: string, title: string }) => ({
            label: <div className="truncate max-w-full">📁 {item.title}</div>,
            value: `project:${item.id}`,
            searchText: item.title,
            rawId: item.id,
            isProject: true
        })),
        ...(lifeAreasQuery.data || []).map((item: { id: string, title: string }) => ({
            label: <div className="truncate max-w-full">🌟 {item.title}</div>,
            value: `lifearea:${item.id}`,
            searchText: item.title,
            rawId: item.id,
            isProject: false
        }))
    ];

    // Group options for display
    const groupedOptions = [
        {
            label: <span style={{ fontWeight: 'bold' }}>📁 Projekte</span>,
            options: allOptions.filter(opt => opt.isProject)
        },
        {
            label: <span style={{ fontWeight: 'bold' }}>🌟 Lebensbereiche</span>,
            options: allOptions.filter(opt => !opt.isProject)
        }
    ];

    // Get current value with prefix
    const currentValue = formData.category 
        ? (formData.isProject ? `project:${formData.category}` : `lifearea:${formData.category}`)
        : undefined;

    return (
        <Row>
            <Col span={24}>
                <Select
                    className="w-full"
                    showSearch
                    // @ts-ignore
                    spellCheck="false"
                    filterOption={(input, option) => {
                        // For grouped options, we check if the value exists in our flat array
                        if (option && 'value' in option) {
                            const fullOption = allOptions.find(opt => opt.value === option.value);
                            return (fullOption?.searchText ?? '').toLowerCase().includes(input.toLowerCase());
                        }
                        return false;
                    }}
                    placeholder="Projekt oder Lebensbereich auswählen..."
                    value={currentValue}
                    onChange={(value) => {
                        if (value) {
                            const [type, id] = value.split(':');
                            onChange(type === 'project', id);
                        }
                    }}
                    options={groupedOptions}
                    loading={projectsQuery.isLoading || lifeAreasQuery.isLoading}
                />
            </Col>
        </Row>
    );
}