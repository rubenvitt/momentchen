import {FormEvent, useEffect, useState} from 'react';
import {Button, Card, Col, Input, List, Row, Select, Space, Tag, TimePicker, Typography} from 'antd';
import {PiCalendar, PiClock} from "react-icons/pi";
import dayjs from 'dayjs';
import {Item, useCreateDatabaseEntry, useDatabase, useNotion} from "../../notion";

const { Text } = Typography;

interface MomentProperties {
    Name: {
        title: Array<{plain_text: string}>;
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
        relation?: Array<{id: string}>;
    };
    Lebensbereich?: {
        relation?: Array<{id: string}>;
    };
}

interface SelectOption {
    id: string;
    name: string;
    color?: string;
}

interface MomentItem extends Item<{properties: MomentProperties}> {}

export const MomentTemplate = () => {
    const { databaseIds, client } = useNotion();
    const [momentTypes, setMomentTypes] = useState<SelectOption[]>([]);

    useEffect(() => {
        const fetchMomentTypes = async () => {
            if (!databaseIds?.moments || !client) return;

            try {
                const database = await client.databases.retrieve({
                    database_id: databaseIds.moments
                });

                const typProperty = database.properties['Typ'];
                console.log('typProperties', typProperty);
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
                        on_or_after: dayjs().startOf('day').toISOString()
                    }
                },
                {
                    property: 'Zeitpunkt',
                    date: {
                        before: dayjs().endOf('day').toISOString()
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
        if (project) return { title: project.title, type: 'project' };

        const lifeArea = lifeAreasQuery.data?.find(la => la.id === relationId);
        if (lifeArea) return { title: lifeArea.title, type: 'lifeArea' };

        return null;
    };

    const [formData, setFormData] = useState({
        description: '',
        type: '',
        category: '',
        isProject: true,
        timestamp: new Date().toISOString().slice(0, 16)
    });

    useEffect(() => {
        if (momentTypes.length > 0 && !formData.type) {
            setFormData(prev => ({
                ...prev,
                type: momentTypes[0].name
            }));
        }
    }, [momentTypes]);

    const {mutateAsync} = useCreateDatabaseEntry(databaseIds?.moments ?? '');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        console.log('[submitting] formData', formData);

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
                        start: formData.timestamp
                    }
                }
            };

            if (formData.category) {
                if (formData.isProject) {
                    (properties as any)['Projekt'] = {
                        relation: [{ id: formData.category }]
                    };
                } else {
                    (properties as any)['Lebensbereich'] = {
                        relation: [{ id: formData.category }]
                    };
                }
            }

            await mutateAsync(properties);

            setFormData({
                description: '',
                type: momentTypes[0]?.name || '',
                category: '',
                isProject: true,
                timestamp: new Date().toISOString().slice(0, 16)
            });
        } catch (error) {
            console.error('Fehler beim Erstellen des Moments:', error);
        }
    };

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

    return (
        <Row justify="center">
            <Col xs={24} sm={24} md={20} lg={16} xl={14} xxl={12}>
                <div className="p-4">
                    <Card className="mb-4">
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
                                        <TimePicker
                                            value={dayjs(formData.timestamp)}
                                            format="HH:mm"
                                            onChange={(time) => {
                                                if (time) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        timestamp: time.format('YYYY-MM-DDTHH:mm:ss')
                                                    }));
                                                }
                                            }}
                                            className="w-24"
                                        />
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
                                        <Space>
                                            <Button
                                                type={formData.isProject ? 'primary' : 'default'}
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    isProject: true,
                                                    category: ''
                                                }))}
                                            >
                                                Projekt
                                            </Button>
                                            <Button
                                                type={!formData.isProject ? 'primary' : 'default'}
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    isProject: false,
                                                    category: ''
                                                }))}
                                            >
                                                Lebensbereich
                                            </Button>
                                        </Space>
                                    </Col>
                                    <Col xs={24} sm={12} md={16}>
                                        <Select
                                            className="w-full"
                                            showSearch
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
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
                                                ? (projectsQuery.data as Item<unknown>[] || []).map(item => ({
                                                    label: item.title,
                                                    value: item.id
                                                }))
                                                : (lifeAreasQuery.data as Item<unknown>[] || []).map(item => ({
                                                    label: item.title,
                                                    value: item.id
                                                }))}
                                            loading={projectsQuery.isLoading || lifeAreasQuery.isLoading}
                                        />
                                    </Col>
                                </Row>
                                <Row justify="end">
                                    <Button type="primary" htmlType="submit">
                                        Absenden
                                    </Button>
                                </Row>
                            </Space>
                        </form>
                    </Card>

                    <Card
                        title={
                            <Row justify="space-between" align="middle">
                                <Col>
                                    Heute ({momentsQuery.data?.length || 0})
                                </Col>
                                <Col>
                                    <PiCalendar className="text-gray-400" />
                                </Col>
                            </Row>
                        }
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
                                                                <Space size="small">
                                                                    <PiClock className="text-gray-400" />
                                                                    <Text type="secondary">
                                                                        {dayjs(moment.content.properties.Zeitpunkt.date.start).format('HH:mm')}
                                                                    </Text>
                                                                </Space>
                                                                {relation && (
                                                                    <Tag color={relation.type === 'project' ? 'blue' : 'green'}>
                                                                        {relation.title}
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
            </Col>
        </Row>
    );
};