import { Col, Row, Select } from "antd";
import { FormData, LifeAreaItem, ProjectItem, QueryResult } from "../../types";

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
    return (
        <Row gutter={[8, 8]} align="middle">
            <Col xs={24} sm={12} md={8}>
                <Select
                    className="w-full"
                    value={formData.isProject ? 'Projekt' : 'Lebensbereich'}
                    onChange={(value) => onChange(value === 'Projekt', '')}
                    options={[
                        {label: 'Projekt', value: 'Projekt'},
                        {label: 'Lebensbereich', value: 'Lebensbereich'}
                    ]}
                />
            </Col>
            <Col xs={24} sm={12} md={16}>
                <Select
                    className="w-full"
                    showSearch
                    // @ts-ignore
                    spellCheck="false"
                    filterOption={(input, option) =>
                        (option?.searchText ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    placeholder={formData.isProject ? "Projekt auswählen..." : "Lebensbereich auswählen..."}
                    value={formData.category || undefined}
                    onChange={(value) => onChange(formData.isProject, value)}
                    options={formData.isProject
                        ? (projectsQuery.data || []).map((item: { id: string, title: string }) => ({
                            label: <div className="truncate max-w-full">{item.title}</div>,
                            value: item.id,
                            searchText: item.id + " " + item.title
                        }))
                        : (lifeAreasQuery.data || []).map((item: { id: string, title: string }) => ({
                            label: <div className="truncate max-w-full">{item.title}</div>,
                            value: item.id,
                            searchText: item.id + " " + item.title
                        }))}
                    loading={projectsQuery.isLoading || lifeAreasQuery.isLoading}
                />
            </Col>
        </Row>
    );
}