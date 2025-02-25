import dayjs from "dayjs";
import { FormEvent } from "react";
import { Item } from "../notion.ts";

export interface MomentProperties {
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

export interface MomentFormProps {
    formData: FormData;
    setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
    momentTypes: SelectOption[];
    currentTime?: dayjs.Dayjs;
    convertToNotionTime: (time: dayjs.Dayjs) => string;
    convertFromNotionTime: (time: string) => dayjs.Dayjs;
    onSubmit: (e: FormEvent) => Promise<void>;
    isPending: boolean;
    projectsQuery: QueryResult<ProjectItem>;
    lifeAreasQuery: QueryResult<LifeAreaItem>;
    isEditing?: boolean;
}

export interface SelectOption {
    id: string;
    name: string;
    color?: string;
}

export interface MomentItem extends Item<{ properties: MomentProperties }> {
}

export interface FormData {
    description: string;
    type: string;
    category: string;
    isProject: boolean;
    timestamp: string;
}

export interface DatabaseIds {
    moments?: string;
    projects?: string;
    lifeAreas?: string;
}

export interface NotionClient {
    databases: {
        retrieve: (params: { database_id: string }) => Promise<any>;
    };
}

export interface NotionContext {
    databaseIds: DatabaseIds | undefined;
    client: NotionClient | null;
}

export interface QueryResult<T> {
    data?: T[];
    isLoading: boolean;
}

export interface ProjectItem {
    id: string;
    title: string;
    icon?: string;
    content: any;
}

export interface LifeAreaItem {
    id: string;
    title: string;
    icon?: string;
    content: any;
}