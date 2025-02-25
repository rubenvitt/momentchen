// src/notion.ts
import { Client } from "@notionhq/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isTauri } from "@tauri-apps/api/core";
import { fetch } from "@tauri-apps/plugin-http";
import { useEffect, useMemo, useState } from "react";
import { initStorage } from "./storage.ts";

const STORAGE_KEYS = {
    NOTION_TOKEN: 'notion_token',
    NOTION_CONFIG: 'notion_config'
} as const;

interface NotionConfig {
    token: string;
    databases: {
        moments: string;
        projects: string;
        lifeAreas: string;
    };
}

async function validateNotionToken(client: Client): Promise<boolean> {
    try {
        const response = await client.users.me({});
        return !!response;
    } catch (error: any) {
        if (error?.status === 401) {
            return false;
        }
        console.error('Notion API Fehler:', error);
        throw error;
    }
}

export function useNotion() {
    const [config, setConfig] = useState<NotionConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [needsSetup, setNeedsSetup] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        const initializeNotion = async () => {
            try {
                const storage = await initStorage();
                const storedConfig = await storage.getItem(STORAGE_KEYS.NOTION_CONFIG);

                if (!storedConfig) {
                    setNeedsSetup(true);
                    return;
                }

                const parsedConfig: NotionConfig = JSON.parse(storedConfig);
                const tempClient = new Client({
                    auth: parsedConfig.token,
                    fetch: isTauri() ? fetch : window.fetch.bind(window)
                });

                const isValid = await validateNotionToken(tempClient);
                if (!isValid) {
                    const storage = await initStorage();
                    await storage.removeItem(STORAGE_KEYS.NOTION_CONFIG);
                    setConfig(null);
                    setNeedsSetup(true);
                    setError("Der gespeicherte Token ist nicht mehr gültig.");
                } else {
                    setConfig(parsedConfig);
                }
            } catch (error) {
                console.error('Error initializing Notion:', error);
                setNeedsSetup(true);
            } finally {
                setIsLoading(false);
            }
        };

        initializeNotion();
    }, []);

    const saveNotionConfig = async (newConfig: NotionConfig) => {
        try {
            setIsLoading(true);
            setError(null);

            const tempClient = new Client({
                auth: newConfig.token,
                fetch: isTauri() ? fetch : window.fetch.bind(window)
            });

            const isValid = await validateNotionToken(tempClient);
            if (!isValid) {
                throw new Error("Der Token ist ungültig.");
            }

            const storage = await initStorage();
            await storage.setItem(STORAGE_KEYS.NOTION_CONFIG, JSON.stringify(newConfig));
            setConfig(newConfig);
            setNeedsSetup(false);

            await queryClient.invalidateQueries();
        } catch (error) {
            console.error('Error saving Notion config:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const client = useMemo(() => {
        return new Client({
            auth: config?.token || 'dummy_token',
            fetch: isTauri() ? fetch : window.fetch.bind(window)
        });
    }, [config?.token]);

    return {
        client,
        isLoading,
        notionToken: !!config?.token,
        databaseIds: config?.databases,
        needsSetup,
        error,
        saveNotionConfig
    };
}

export type Item<T> = {
    id: string;
    icon: string;
    title: string;
    content: T;
};

export function useDatabase<T>(
    databaseId: string,
    filter: any,
    map: (item: any) => Item<T>
) {
    const { client, notionToken } = useNotion();

    return useQuery({
        queryKey: ['database', databaseId, filter],
        queryFn: async (): Promise<Item<T>[]> => {
            if (!client) {
                return [];
            }

            try {
                const databaseResponse = await client.databases.query({
                    database_id: databaseId,
                    page_size: 100,
                    filter: filter
                });

                return databaseResponse.results.map(map);
            } catch (error) {
                console.error('Error fetching database:', error);
                throw error;
            }
        },
        enabled: !!client && notionToken && !!databaseId,
        refetchInterval: 1000 * 15 // 15 Sekunden
    });
}
// Optional: Mutation Hook für das Erstellen neuer Einträge
export function useCreateDatabaseEntry(databaseId: string) {
    const {client} = useNotion();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (properties: any) => {
            if (!client) {
                throw new Error("Notion client nicht initialisiert");
            }

            return await client.pages.create({
                parent: {database_id: databaseId},
                properties,
            });
        },
        onSuccess: async () => {
            // Invalidiere alle database queries nach erfolgreicher Mutation
            await queryClient.invalidateQueries({queryKey: ['database']});
        },
    });
}

// Hook für das Aktualisieren eines bestehenden Eintrags
export function useUpdateDatabaseEntry() {
    const { client } = useNotion();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ pageId, properties }: { pageId: string, properties: any }) => {
            if (!client) {
                throw new Error("Notion client nicht initialisiert");
            }

            return await client.pages.update({
                page_id: pageId,
                properties,
            });
        },
        onSuccess: async () => {
            // Invalidiere alle database queries nach erfolgreicher Mutation
            await queryClient.invalidateQueries({ queryKey: ['database'] });
        },
    });
}