import {FormEvent} from 'react';
import {Card, Col, Row} from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {useCreateDatabaseEntry, useDatabase, useNotion} from "../../notion";
import {ThemeToggle} from "../providers/theme.provider.tsx";
import {useCurrentTime, useTimeConversion} from "../../hooks/time.ts";
import {useMomentForm, useMomentTypes} from "../../hooks/moment.ts";
import {MomentForm} from "../molecules/moment-form.component.molecule.tsx";
import {MomentList} from "../organisms/moment-list.organism.tsx";

// Activate dayjs plugins for timezone handling
dayjs.extend(utc);
dayjs.extend(timezone);

export function MomentTemplate() {
    const notionContext = useNotion();
    const currentTime = useCurrentTime();
    const momentTypes = useMomentTypes(notionContext);
    const {convertToNotionTime, convertFromNotionTime} = useTimeConversion();
    const {formData, setFormData} = useMomentForm(momentTypes, currentTime, convertToNotionTime);
    const {mutateAsync, isPending} = useCreateDatabaseEntry(notionContext.databaseIds?.moments ?? '');

    const momentsQuery = useDatabase(
        notionContext.databaseIds?.moments || '',
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
        notionContext.databaseIds?.projects || '',
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
        notionContext.databaseIds?.lifeAreas || '',
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!notionContext.client || !notionContext.databaseIds?.moments) return;

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
3
    return <Row justify="center">
        <Col xs={24} sm={24} md={20} lg={16} xl={14} xxl={12}>
            <div className="flex flex-col h-screen">
                <div className="p-4 flex-none">
                    <div className="flex justify-end mb-4">
                        <ThemeToggle/>
                    </div>
                    <Card className="mb-4 dark:bg-gray-800">
                        <MomentForm
                            formData={formData}
                            setFormData={setFormData}
                            momentTypes={momentTypes}
                            currentTime={currentTime}
                            convertToNotionTime={convertToNotionTime}
                            convertFromNotionTime={convertFromNotionTime}
                            onSubmit={handleSubmit}
                            isPending={isPending}
                            projectsQuery={projectsQuery}
                            lifeAreasQuery={lifeAreasQuery}
                        />
                    </Card>
                </div>
                <div className="flex-1 p-4 overflow-auto">
                    <MomentList
                        momentsQuery={momentsQuery}
                        projectsQuery={projectsQuery}
                        lifeAreasQuery={lifeAreasQuery}
                        convertFromNotionTime={convertFromNotionTime}
                    />
                </div>
            </div>
        </Col>
    </Row>
}