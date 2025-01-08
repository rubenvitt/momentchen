import {LifeAreaItem, MomentItem, ProjectItem, QueryResult} from "../../types";
import dayjs from "dayjs";
import {getNotionColor, resolveRelation} from "../../helper";
import {Col, List, Row, Space, Tag, Typography} from "antd";
import {TimeDisplay} from "../atoms/time.component.tsx";

const {Text} = Typography;

export function MomentListItem({
                                   moment,
                                   projectsQuery,
                                   lifeAreasQuery,
                                   convertFromNotionTime
                               }: {
    moment: MomentItem,
    projectsQuery: QueryResult<ProjectItem>,
    lifeAreasQuery: QueryResult<LifeAreaItem>,
    convertFromNotionTime: (time: string) => dayjs.Dayjs
}) {
    const relationId = moment.content.properties.Projekt?.relation?.[0]?.id ||
        moment.content.properties.Lebensbereich?.relation?.[0]?.id;
    const relation = resolveRelation(relationId, projectsQuery, lifeAreasQuery);
    const momentType = moment.content.properties.Typ?.select;

    return (
        <List.Item>
            <Row gutter={[8, 8]}>
                <Col xs={24}>
                    <Space align="start" className="w-full">
                        {momentType && (
                            <Tag color={getNotionColor(momentType.color)}>
                                {momentType.name}
                            </Tag>
                        )}
                        <div className="flex-1">
                            <Text>{moment.title}</Text>
                            <div className="mt-2">
                                <Space size="small" wrap>
                                    <TimeDisplay
                                        notionTime={moment.content.properties.Zeitpunkt.date.start}
                                        convertFromNotionTime={convertFromNotionTime}
                                    />
                                    {relation && (
                                        <Tag color={relation.type === 'project' ? 'blue' : 'green'}>
                                            <span className="truncate inline-block align-bottom">
                                                {relation.title}
                                            </span>
                                        </Tag>
                                    )}
                                </Space>
                            </div>
                        </div>
                    </Space>
                </Col>
            </Row>
        </List.Item>
    );
}