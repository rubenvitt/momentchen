import {FormData, NotionContext, SelectOption} from "../types";
import {useEffect, useState} from "react";
import dayjs from "dayjs";

export const useMomentTypes = ({databaseIds, client}: NotionContext) => {
    const [momentTypes, setMomentTypes] = useState<SelectOption[]>([]);

    useEffect(() => {
        const fetchMomentTypes = async () => {
            if (!databaseIds?.moments || !client) return;

            try {
                const database = await client.databases.retrieve({
                    database_id: databaseIds.moments
                });

                const typProperty = database.properties['Typ'];
                const typOptions = (typProperty?.type === 'select' ? typProperty.select?.options : []) || [];
                setMomentTypes(typOptions.map((option: { id: string; name: string; color?: string }) => ({
                    id: option.id,
                    name: option.name,
                    color: option.color
                })));
            } catch (error) {
                console.error('Error loading moment types:', error);
            }
        };

        fetchMomentTypes();
    }, [databaseIds?.moments, client]);

    return momentTypes;
};
export const useMomentForm = (momentTypes: SelectOption[], currentTime: dayjs.Dayjs, convertToNotionTime: (time: dayjs.Dayjs) => string) => {
    const [formData, setFormData] = useState<FormData>({
        description: '',
        type: '',
        category: '',
        isProject: true,
        timestamp: convertToNotionTime(currentTime)
    });

    useEffect(() => {
        if (!formData.description) {
            setFormData(prev => ({
                ...prev,
                timestamp: convertToNotionTime(currentTime)
            }));
        }
    }, [currentTime, convertToNotionTime, formData.description]);

    useEffect(() => {
        if (momentTypes.length > 0 && !formData.type) {
            setFormData(prev => ({
                ...prev,
                type: momentTypes[0].name
            }));
        }
    }, [momentTypes]);

    return {formData, setFormData};
};