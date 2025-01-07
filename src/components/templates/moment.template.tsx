import {FormEvent, useCallback, useEffect, useState} from 'react';
import {Button, Card, Col, Input, List, Row, Select, Space, Tag, TimePicker, Tooltip, Typography} from 'antd';
import {PiBoxArrowDown, PiCalendar, PiClock, PiSpinnerBall} from "react-icons/pi";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {Item, useCreateDatabaseEntry, useDatabase, useNotion} from "../../notion";
import {ThemeToggle} from "../providers/theme.provider.tsx";

// Dayjs Plugins für Zeitzonen-Handling aktivieren
dayjs.extend(utc);
dayjs.extend(timezone);

const {Text} = Typography;

interface MomentProperties {
    Name: {
        title: Array<{ plain_text: string }>;
    };
    Typ: {
        select: {
            name: string;
            color?: string;
        };
    };
    Zeitpunkt: {
        date: {
            start: string;
        };
    };
    Projekt?: {
        relation?: Array<{ id: string }>;
    };
    Lebensbereich?: {
        relation?: Array<{ id: string }>;
    };
}

interface SelectOption {
    id: string;
    name: string;
    color?: string;
}

interface MomentItem extends Item<{ properties: MomentProperties }> {
}

export const MomentTemplate = () => {
    const {databaseIds, client} = useNotion();
    const [momentTypes, setMomentTypes] = useState<SelectOption[]>([]);

    // Aktualisierung der Zeit alle 60 Sekunden
    const [currentTime, setCurrentTime] = useState(dayjs());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(dayjs());
        }, 1000); // Jede Sekunde aktualisieren

        return () => clearInterval(timer);
    }, []);

    // Funktion zum Konvertieren der lokalen Zeit in UTC für Notion
    const convertToNotionTime = useCallback((localTime: dayjs.Dayjs) => {
        return localTime.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    }, []);

    // Funktion zum Konvertieren der Notion-Zeit (UTC) in lokale Zeit
    const convertFromNotionTime = useCallback((notionTime: string) => {
        return dayjs.utc(notionTime).local();
    }, []);

    useEffect(() => {
        const fetchMomentTypes = async () => {
            if (!databaseIds?.moments || !client) return;

            try {
                const database = await client.databases.retrieve({
                    database_id: databaseIds.moments
                });

                const typProperty = database.properties['Typ'];
                const typOptions = (typProperty?.type === 'select' ? typProperty.select?.options : []) || [];
                setMomentTypes(typOptions.map(option => ({
                    id: option.id,
                    name: option.name,
                    color: option.color
                })));
            } catch (error) {
                console.error('Fehler beim Laden der Moment-Typen:', error);
            }
        };

        fetchMomentTypes();
    }, [databaseIds?.moments, client]);

    const momentsQuery = useDatabase(
        databaseIds?.moments || '',
        {
            and: [
                {
                    property: 'Zeitpunkt',
                    date: {
                        on_or_after: dayjs().startOf('day').utc().format()
                    }
                },
                {
                    property: 'Zeitpunkt',
                    date: {
                        before: dayjs().endOf('day').utc().format()
                    }
                }
            ]
        },
        (item) => ({
            id: item.id,
            icon: (item as any)['icon']?.['external'] || '',
            title: (item as any)['properties']['Name']['title'][0]['plain_text'],
            content: item
        })
    );

    const projectsQuery = useDatabase(
        databaseIds?.projects || '',
        {
            property: 'Status',
            status: {
                equals: 'In Bearbeitung'
            }
        },
        (item) => ({
            id: item.id,
            icon: (item as any)['icon']?.['external'] || '',
            title: (item as any)['properties']?.['Projekt']?.['title']?.[0]?.['plain_text'] || '',
            content: item
        })
    );

    const lifeAreasQuery = useDatabase(
        databaseIds?.lifeAreas || '',
        {
            property: 'Status',
            status: {
                equals: 'Aktiv'
            }
        },
        (item) => ({
            id: item.id,
            icon: (item as any)['icon']?.['external'] || '',
            title: (item as any)['properties']['Thema']['title'][0]['plain_text'],
            content: item
        })
    );

    const resolveRelation = (relationId: string | undefined) => {
        if (!relationId) return null;

        const project = projectsQuery.data?.find(p => p.id === relationId);
        if (project) return {title: project.title, type: 'project'};

        const lifeArea = lifeAreasQuery.data?.find(la => la.id === relationId);
        if (lifeArea) return {title: lifeArea.title, type: 'lifeArea'};

        return null;
    };

    const [formData, setFormData] = useState({
        description: '',
        type: '',
        category: '',
        isProject: true,
        timestamp: convertToNotionTime(currentTime)
    });

    // Automatische Aktualisierung der Formularzeit
    useEffect(() => {
        if (!formData.description) { // Nur aktualisieren wenn kein Text eingegeben wurde
            setFormData(prev => ({
                ...prev,
                timestamp: convertToNotionTime(currentTime)
            }));
        }
    }, [currentTime, convertToNotionTime]);

    useEffect(() => {
        if (momentTypes.length > 0 && !formData.type) {
            setFormData(prev => ({
                ...prev,
                type: momentTypes[0].name
            }));
        }
    }, [momentTypes]);

    const {mutateAsync, isPending} = useCreateDatabaseEntry(databaseIds?.moments ?? '');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!client || !databaseIds?.moments) return;

        try {
            const properties = {
                Name: {
                    title: [
                        {
                            text: {
                                content: formData.description
                            }
                        }
                    ]
                },
                Typ: {
                    select: {
                        name: formData.type
                    }
                },
                Zeitpunkt: {
                    date: {
                        start: formData.timestamp // Bereits im UTC-Format
                    }
                }
            };

            if (formData.category) {
                if (formData.isProject) {
                    (properties as any)['Projekt'] = {
                        relation: [{id: formData.category}]
                    };
                } else {
                    (properties as any)['Lebensbereich'] = {
                        relation: [{id: formData.category}]
                    };
                }
            }

            await mutateAsync(properties);

            setFormData({
                description: '',
                type: momentTypes[0]?.name || '',
                category: '',
                isProject: true,
                timestamp: convertToNotionTime(currentTime)
            });
        } catch (error) {
            console.error('Fehler beim Erstellen des Moments:', error);
        }
    };

    // Funktion zum Konvertieren der Notion-Farben in Ant Design Farben
    const getNotionColor = (notionColor: string = 'default'): string => {
        const colorMap: Record<string, string> = {
            blue: 'blue',
            brown: 'volcano',
            green: 'green',
            yellow: 'warning',
            red: 'error',
            orange: 'orange',
            purple: 'purple',
            pink: 'pink',
            gray: 'default',
            default: 'default'
        };
        return colorMap[notionColor] || 'default';
    };

    // Render-Part für die Zeit im List.Item
    const renderTime = (notionTime: string) => {
        const localTime = convertFromNotionTime(notionTime);
        return (
            <Space size="small">
                <PiClock className="text-gray-400"/>
                <Text type="secondary">
                    {localTime.format('HH:mm')}
                </Text>
            </Space>
        );
    };

    return (
        <Row justify="center">
            <Col xs={24} sm={24} md={20} lg={16} xl={14} xxl={12}>
                <div className="flex flex-col h-screen">
                    <div className="p-4 flex-none">
                        <div className="flex justify-end mb-4">
                            <ThemeToggle />
                        </div>
                        <Card className="mb-4 dark:bg-gray-800">
                            <form onSubmit={handleSubmit}>
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
                                            <Space size={0}>
                                                <TimePicker
                                                    rootClassName="rounded-r-none border-r-0"
                                                    value={convertFromNotionTime(formData.timestamp)}
                                                    format="HH:mm"
                                                    onChange={(time) => {
                                                        if (time) {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                timestamp: convertToNotionTime(time)
                                                            }));
                                                        }
                                                    }}
                                                    showNow
                                                    className="w-24"
                                                />
                                                <Tooltip title="Jetzt">
                                                    <Button
                                                        rootClassName="rounded-l-none"
                                                        onClick={() => {
                                                            const now = dayjs();
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                timestamp: convertToNotionTime(now)
                                                            }));
                                                        }}
                                                        icon={<PiSpinnerBall/>}
                                                    >
                                                    </Button>
                                                </Tooltip>
                                            </Space>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col span={24}>
                                            <Space wrap size={[0, 8]}>
                                                {momentTypes.map(type => (
                                                    <Tag
                                                        key={type.id}
                                                        color={formData.type === type.name ? getNotionColor(type.color) : 'default'}
                                                        className="cursor-pointer select-none m-1"
                                                        onClick={() => setFormData(prev => ({...prev, type: type.name}))}
                                                    >
                                                        {type.name}
                                                    </Tag>
                                                ))}
                                            </Space>
                                        </Col>
                                    </Row>

                                    <Row gutter={[8, 8]} align="middle">
                                        <Col xs={24} sm={12} md={8}>
                                            <Select
                                                className="w-full"
                                                value={formData.isProject ? 'Projekt' : 'Lebensbereich'}
                                                onChange={(value) => setFormData(prev => ({
                                                    ...prev,
                                                    isProject: value === 'Projekt',
                                                    category: ''
                                                }))}
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
                                                filterOption={(input, option) =>
                                                    (option?.searchText ?? '').toLowerCase().includes(input.toLowerCase())
                                                }
                                                placeholder={formData.isProject
                                                    ? "Projekt auswählen..."
                                                    : "Lebensbereich auswählen..."
                                                }
                                                value={formData.category || undefined}
                                                onChange={(value) => setFormData(prev => ({
                                                    ...prev,
                                                    category: value
                                                }))}
                                                options={formData.isProject
                                                    ? (projectsQuery.data || []).map(item => ({
                                                        label: <div className="truncate max-w-full">{item.title}</div>,
                                                        value: item.id,
                                                        searchText: item.id + " " + item.title
                                                    }))
                                                    : (lifeAreasQuery.data || []).map(item => ({
                                                        label: <div className="truncate max-w-full">{item.title}</div>,
                                                        value: item.id,
                                                        searchText: item.id + " " + item.title
                                                    }))}
                                                loading={projectsQuery.isLoading || lifeAreasQuery.isLoading}
                                            />
                                        </Col>
                                    </Row>
                                    <Row justify="end">
                                        <Tooltip title="Moment speichern" placement="topLeft" className="mr-2">
                                            <Button icon={<PiBoxArrowDown/>} type="primary" htmlType="submit" loading={isPending}/>
                                        </Tooltip>
                                    </Row>
                                </Space>
                            </form>
                        </Card>
                    </div>
                    <div className="flex-1 p-4 overflow-auto">
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
                                renderItem={(moment: MomentItem) => {
                                    const relationId = moment.content.properties.Projekt?.relation?.[0]?.id ||
                                        moment.content.properties.Lebensbereich?.relation?.[0]?.id;
                                    const relation = resolveRelation(relationId);
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
                                                                    {renderTime(moment.content.properties.Zeitpunkt.date.start)}
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
                                }}
                            />
                        </Card>
                    </div>
                </div>
            </Col>
        </Row>
    );
};