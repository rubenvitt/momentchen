import { Badge, Card, Col, Empty, List, Row, Spin, Typography } from "antd";
import dayjs from "dayjs";
import { PiCalendar } from "react-icons/pi";
import { LifeAreaItem, MomentItem, ProjectItem, QueryResult } from "../../types";
import { MomentListItem } from "../molecules/moment-list-item.molecule.tsx";

const { Text } = Typography;

export function MomentList({
                               momentsQuery,
                               projectsQuery,
                               lifeAreasQuery,
    convertFromNotionTime,
    onEditMoment
                           }: {
    momentsQuery: QueryResult<MomentItem>,
    projectsQuery: QueryResult<ProjectItem>,
    lifeAreasQuery: QueryResult<LifeAreaItem>,
        convertFromNotionTime: (time: string) => dayjs.Dayjs,
        onEditMoment?: (moment: MomentItem) => void
}) {
    const momentsCount = momentsQuery.data?.length || 0;

    return (
        <Card
            title={
                <Row justify="space-between" align="middle">
                    <Col>
                        <div className="flex items-center gap-2">
                            <Text strong className="text-lg m-0">Heute</Text>
                            <Badge
                                count={momentsCount}
                                style={{ backgroundColor: '#52c41a' }}
                                className="ml-4"
                            />
                        </div>
                    </Col>
                    <Col>
                        <PiCalendar className="text-xl text-gray-400 dark:text-gray-500" />
                    </Col>
                </Row>
            }
            className="dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
            bodyStyle={{ padding: '12px 16px' }}
        >
            {momentsQuery.isLoading ? (
                <div className="flex justify-center py-8">
                    <Spin size="large" />
                </div>
            ) : momentsCount === 0 ? (
                <Empty
                    description="Keine Momente für heute"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="my-4"
                />
            ) : (
                        <List
                            itemLayout="vertical"
                            dataSource={momentsQuery.data as MomentItem[]}
                            className="moment-list"
                            renderItem={(moment: MomentItem) => (
                                <MomentListItem
                                    moment={moment}
                                    projectsQuery={projectsQuery}
                                    lifeAreasQuery={lifeAreasQuery}
                                    convertFromNotionTime={convertFromNotionTime}
                                    onEdit={onEditMoment}
                                />
                            )}
                        />
            )}
        </Card>
    );
}