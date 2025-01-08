import {LifeAreaItem, MomentItem, ProjectItem, QueryResult} from "../../types";
import dayjs from "dayjs";
import {Card, Col, List, Row} from "antd";
import {PiCalendar} from "react-icons/pi";
import {MomentListItem} from "../molecules/moment-list-item.molecule.tsx";

export function MomentList({
                               momentsQuery,
                               projectsQuery,
                               lifeAreasQuery,
                               convertFromNotionTime
                           }: {
    momentsQuery: QueryResult<MomentItem>,
    projectsQuery: QueryResult<ProjectItem>,
    lifeAreasQuery: QueryResult<LifeAreaItem>,
    convertFromNotionTime: (time: string) => dayjs.Dayjs
}) {
    return (
        <Card
            title={
                <Row justify="space-between" align="middle">
                    <Col>
                        Heute ({momentsQuery.data?.length || 0})
                    </Col>
                    <Col>
                        <PiCalendar className="text-gray-400 dark:text-gray-500"/>
                    </Col>
                </Row>
            }
            className="dark:bg-gray-800"
        >
            <List
                itemLayout="vertical"
                loading={momentsQuery.isLoading}
                dataSource={momentsQuery.data as MomentItem[]}
                renderItem={(moment: MomentItem) => (
                    <MomentListItem
                        moment={moment}
                        projectsQuery={projectsQuery}
                        lifeAreasQuery={lifeAreasQuery}
                        convertFromNotionTime={convertFromNotionTime}
                    />
                )}
            />
        </Card>
    );
}