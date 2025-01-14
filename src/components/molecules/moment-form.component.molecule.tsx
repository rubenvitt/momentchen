import {MomentFormProps} from "../../types";
import {Button, Col, Input, InputRef, Row, Space, Tooltip} from "antd";
import {MomentTypeSelector} from "../atoms/moment-type-selector.component.tsx";
import {CategorySelector} from "../atoms/category-selector.component.tsx";
import {PiBoxArrowDown} from "react-icons/pi";
import {TimeInput} from "./time-input.molecule.tsx";
import {useRef} from "react";

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
    const ref = useRef<InputRef>(null)

    return (
        <form onSubmit={(e) => onSubmit(e).then(() => ref.current?.focus())}>
            <Space direction="vertical" size="middle" className="w-full">
                <Row gutter={[8, 8]}>
                    <Col flex="auto">
                        <Input
                            placeholder="Was ist passiert? Drücke Enter zum Speichern"
                            value={formData.description}
                            ref={ref}
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