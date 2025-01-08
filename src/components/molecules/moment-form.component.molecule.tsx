import {MomentFormProps} from "../../types";
import {Button, Col, Input, Row, Space, Tooltip} from "antd";
import {MomentTypeSelector} from "../atoms/moment-type-selector.component.tsx";
import {CategorySelector} from "../atoms/category-selector.component.tsx";
import {PiBoxArrowDown} from "react-icons/pi";
import {TimeInput} from "./time-input.molecule.tsx";

export function MomentForm({
                               formData,
                               setFormData,
                               momentTypes,
                               convertToNotionTime,
                               convertFromNotionTime,
                               onSubmit,
                               isPending,
                               projectsQuery,
                               lifeAreasQuery
                           }: MomentFormProps) {
    return (
        <form onSubmit={onSubmit}>
            <Space direction="vertical" size="middle" className="w-full">
                <Row gutter={[8, 8]}>
                    <Col flex="auto">
                        <Input
                            placeholder="Was ist passiert? Drücke Enter zum Speichern"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                description: e.target.value
                            }))}
                        />
                    </Col>
                    <Col flex="none">
                        <TimeInput
                            formData={formData}
                            setFormData={setFormData}
                            convertFromNotionTime={convertFromNotionTime}
                            convertToNotionTime={convertToNotionTime}
                        />
                    </Col>
                </Row>

                <Row>
                    <Col span={24}>
                        <MomentTypeSelector
                            types={momentTypes}
                            selectedType={formData.type}
                            onTypeSelect={(type) => setFormData(prev => ({...prev, type}))}
                        />
                    </Col>
                </Row>

                <CategorySelector
                    formData={formData}
                    projectsQuery={projectsQuery}
                    lifeAreasQuery={lifeAreasQuery}
                    onChange={(isProject, category) =>
                        setFormData(prev => ({...prev, isProject, category}))}
                />

                <Row justify="end">
                    <Tooltip title="Moment speichern" placement="topLeft" className="mr-2">
                        <Button
                            icon={<PiBoxArrowDown/>}
                            type="primary"
                            htmlType="submit"
                            loading={isPending}
                        />
                    </Tooltip>
                </Row>
            </Space>
        </form>
    );
}