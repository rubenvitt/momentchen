import { Avatar as AntAvatar, Button, Col, List, Row, Space, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import { PiNotepad, PiPencilSimple } from "react-icons/pi";
import { getNotionBackgroundColor, getNotionColor, resolveRelation } from "../../helper";
import { LifeAreaItem, MomentItem, ProjectItem, QueryResult } from "../../types";
import { TimeDisplay } from "../atoms/time.component.tsx";


export function MomentListItem({
                                   moment,
                                   projectsQuery,
                                   lifeAreasQuery,
    convertFromNotionTime,
    onEdit
                               }: {
    moment: MomentItem,
    projectsQuery: QueryResult<ProjectItem>,
    lifeAreasQuery: QueryResult<LifeAreaItem>,
        convertFromNotionTime: (time: string) => dayjs.Dayjs,
        onEdit?: (moment: MomentItem) => void
}) {
    const relationId = moment.content.properties.Projekt?.relation?.[0]?.id ||
        moment.content.properties.Lebensbereich?.relation?.[0]?.id;
    const relation = resolveRelation(relationId, projectsQuery, lifeAreasQuery);
    const momentType = moment.content.properties.Typ?.select;

    // Farben basierend auf dem Typ oder Standard
    const typeColor = momentType ? getNotionColor(momentType.color) : 'blue';
    const bgColor = momentType ? getNotionBackgroundColor(momentType.color) : 'blue';

    // Textfarbe auf dem Avatar basierend auf der Hintergrundfarbe bestimmen
    const isDarkBg = ['blue', 'brown', 'green', 'red', 'purple'].includes(bgColor);
    const avatarTextColor = isDarkBg ? 'white' : 'rgba(0,0,0,0.8)';

    return (
        <List.Item className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors p-2 rounded-md">
            <Row gutter={[16, 12]} align="middle" className="w-full">
                <Col xs={24} sm={24}>
                    <Space size={16} align="start" className="w-full">
                        <AntAvatar
                            size={40}
                            style={{
                                backgroundColor: bgColor === 'default' ? '#1890ff' : bgColor,
                                color: avatarTextColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            icon={<PiNotepad size={22} />}
                        />

                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">{moment.title}</span>
                                {onEdit && (
                                    <Button
                                        type="text"
                                        icon={<PiPencilSimple />}
                                        size="small"
                                        onClick={() => onEdit(moment)}
                                        className="text-gray-500 hover:text-blue-500"
                                        aria-label="Moment bearbeiten"
                                    />
                                )}
                            </div>

                            <Space size="small" wrap className="mb-1">
                                <TimeDisplay
                                    notionTime={moment.content.properties.Zeitpunkt.date.start}
                                    convertFromNotionTime={convertFromNotionTime}
                                />

                                {momentType && (
                                    <Tag color={typeColor} className="mr-0">
                                        {momentType.name}
                                    </Tag>
                                )}

                                {relation && (
                                    <Tooltip title={relation.title} placement="top">
                                        <Tag
                                            color={relation.type === 'project' ? 'blue' : 'green'}
                                            className="mr-0 inline-flex items-center"
                                            style={{ maxWidth: '100%' }}
                                        >
                                            <span
                                                className="truncate block w-full max-w-[120px] sm:max-w-[150px] md:max-w-[200px]"
                                                style={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {relation.title}
                                            </span>
                                        </Tag>
                                    </Tooltip>
                                )}
                            </Space>
                        </div>
                    </Space>
                </Col>
            </Row>
        </List.Item>
    );
}

