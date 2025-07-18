import { Button, Col, Input, InputRef, Row, Space, Tooltip } from "antd";
import { useRef } from "react";
import { PiBoxArrowDown, PiFloppyDisk } from "react-icons/pi";
import { MomentFormProps } from "../../types";
import { CategorySelector } from "../atoms/category-selector.component.tsx";
import { MomentTypeSelector } from "../atoms/moment-type-selector.component.tsx";
import { TimeInput } from "./time-input.molecule.tsx";

export function MomentForm({
                               formData,
                               setFormData,
                               momentTypes,
                               convertToNotionTime,
                               convertFromNotionTime,
                               onSubmit,
                               isPending,
                               projectsQuery,
    lifeAreasQuery,
    isEditing = false
}: MomentFormProps & { isEditing?: boolean }) {
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
                    <Tooltip title={isEditing ? "Änderungen speichern" : "Moment speichern"} placement="topLeft" className="mr-2">
                        <Button
                            icon={isEditing ? <PiFloppyDisk /> : <PiBoxArrowDown />}
                            type="primary"
                            htmlType="submit"
                            loading={isPending}
                        >
                            {isEditing ? "Speichern" : "Erstellen"}
                        </Button>
                    </Tooltip>
                </Row>
            </Space>
        </form>
    );
}