import { Button, Card, Col, Row } from 'antd';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { FormEvent, useState } from 'react';
import { useMomentForm, useMomentTypes } from "../../hooks/moment.ts";
import { useCurrentTime, useTimeConversion } from "../../hooks/time.ts";
import { useCreateDatabaseEntry, useDatabase, useNotion, useUpdateDatabaseEntry } from "../../notion";
import { MomentItem } from '../../types';
import { MomentForm } from "../molecules/moment-form.component.molecule.tsx";
import { MomentList } from "../organisms/moment-list.organism.tsx";
import { ThemeToggle } from "../providers/theme.provider.tsx";

// Activate dayjs plugins for timezone handling
dayjs.extend(utc);
dayjs.extend(timezone);

export function MomentTemplate() {
    const notionContext = useNotion();
    const currentTime = useCurrentTime();
    const momentTypes = useMomentTypes(notionContext);
    const {convertToNotionTime, convertFromNotionTime} = useTimeConversion();
    const {formData, setFormData} = useMomentForm(momentTypes, currentTime, convertToNotionTime);
    const { mutateAsync: createMoment, isPending: isCreating } = useCreateDatabaseEntry(notionContext.databaseIds?.moments ?? '');
    const { mutateAsync: updateMoment, isPending: isUpdating } = useUpdateDatabaseEntry();

    // Zustand für den Bearbeitungsmodus
    const [editingMoment, setEditingMoment] = useState<MomentItem | null>(null);
    const isPending = isCreating || isUpdating;

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
                    // Bei Bearbeitung vorhandene Lebensbereich-Relation löschen
                    if (editingMoment && editingMoment.content.properties.Lebensbereich) {
                        (properties as any)['Lebensbereich'] = {
                            relation: []
                        };
                    }
                } else {
                    (properties as any)['Lebensbereich'] = {
                        relation: [{id: formData.category}]
                    };
                    // Bei Bearbeitung vorhandene Projekt-Relation löschen
                    if (editingMoment && editingMoment.content.properties.Projekt) {
                        (properties as any)['Projekt'] = {
                            relation: []
                        };
                    }
                }
            } else {
                // Wenn keine Kategorie gewählt ist, bestehende Relationen löschen
                if (editingMoment) {
                    if (editingMoment.content.properties.Projekt) {
                        (properties as any)['Projekt'] = {
                            relation: []
                        };
                    }
                    if (editingMoment.content.properties.Lebensbereich) {
                        (properties as any)['Lebensbereich'] = {
                            relation: []
                        };
                    }
                }
            }

            if (editingMoment) {
                // Moment aktualisieren
                await updateMoment({
                    pageId: editingMoment.id,
                    properties
                });
                setEditingMoment(null);
            } else {
                // Neuen Moment erstellen
                await createMoment(properties);
            }

            // Formular zurücksetzen
            setFormData({
                description: '',
                type: momentTypes[0]?.name || '',
                category: '',
                isProject: true,
                timestamp: convertToNotionTime(currentTime)
            });
        } catch (error) {
            console.error('Fehler beim Speichern des Moments:', error);
        }
    };

    // Handler für das Bearbeiten eines Moments
    const handleEditMoment = (moment: MomentItem) => {
        const momentProps = moment.content.properties;
        const relationId = momentProps.Projekt?.relation?.[0]?.id ||
            momentProps.Lebensbereich?.relation?.[0]?.id || '';
        const isProject = !!momentProps.Projekt?.relation?.[0]?.id;

        setFormData({
            description: moment.title,
            type: momentProps.Typ?.select?.name || momentTypes[0]?.name || '',
            category: relationId,
            isProject: isProject,
            timestamp: momentProps.Zeitpunkt.date.start
        });

        setEditingMoment(moment);
    };

    // Handler für das Abbrechen der Bearbeitung
    const handleCancelEdit = () => {
        setEditingMoment(null);
        setFormData({
            description: '',
            type: momentTypes[0]?.name || '',
            category: '',
            isProject: true,
            timestamp: convertToNotionTime(currentTime)
        });
    };

    return <Row justify="center">
        <Col xs={24} sm={24} md={20} lg={16} xl={14} xxl={12}>
            <div className="flex flex-col h-screen">
                <div className="p-4 flex-none">
                    <div className="flex justify-end mb-4">
                        <ThemeToggle/>
                    </div>
                    <Card className="mb-4 dark:bg-gray-800">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-medium m-0">
                                {editingMoment ? 'Moment bearbeiten' : 'Neuen Moment erstellen'}
                            </h3>
                            {editingMoment && (
                                <Button
                                    onClick={handleCancelEdit}
                                    size="small"
                                >
                                    Abbrechen
                                </Button>
                            )}
                        </div>
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
                            isEditing={!!editingMoment}
                        />
                    </Card>
                </div>
                <div className="flex-1 p-4 overflow-auto">
                    <MomentList
                        momentsQuery={momentsQuery}
                        projectsQuery={projectsQuery}
                        lifeAreasQuery={lifeAreasQuery}
                        convertFromNotionTime={convertFromNotionTime}
                        onEditMoment={handleEditMoment}
                    />
                </div>
            </div>
        </Col>
    </Row>
}