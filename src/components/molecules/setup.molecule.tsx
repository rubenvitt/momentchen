import React, {useState} from 'react';
import {Alert, Button, Card, Input, Select, Space, Spin, Typography} from 'antd';
import {Client} from '@notionhq/client';
import {fetch} from "@tauri-apps/plugin-http";
import {isTauri} from "@tauri-apps/api/core";

const { Text, Link } = Typography;

interface Database {
    id: string;
    title: string;
}

interface NotionConfig {
    token: string;
    databases: {
        moments: string;
        projects: string;
        lifeAreas: string;
    };
}

interface NotionSetupProps {
    onSave: (config: NotionConfig) => Promise<void>;
}

export const NotionSetup: React.FC<NotionSetupProps> = ({ onSave }) => {
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [databases, setDatabases] = useState<Database[]>([]);
    const [selectedDatabases, setSelectedDatabases] = useState<NotionConfig['databases']>({
        moments: '',
        projects: '',
        lifeAreas: ''
    });
    const [step, setStep] = useState<'token' | 'databases'>('token');

    const fetchDatabases = async (client: Client) => {
        try {
            const response = await client.search({
                filter: {
                    property: 'object',
                    value: 'database'
                }
            });

            return response.results.map((db: any) => ({
                id: db.id,
                title: db.title[0]?.plain_text || 'Unbenannte Datenbank'
            }));
        } catch (error) {
            console.error('Error fetching databases:', error);
            throw new Error('Datenbanken konnten nicht geladen werden');
        }
    };

    const validateToken = async (inputToken: string) => {
        const client = new Client({ auth: inputToken, fetch: isTauri() ? fetch : window.fetch.bind(window) });
        try {
            await client.users.me({});
            const dbs = await fetchDatabases(client);
            setDatabases(dbs);
            setStep('databases');
        } catch (error) {
            throw new Error('Token ist ungültig');
        }
    };

    const handleTokenSubmit = async () => {
        if (!token.trim()) {
            setError('Bitte gib einen Token ein');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await validateToken(token.trim());
        } catch (err) {
            setError('Der Token konnte nicht validiert werden. Bitte versuche es erneut.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDatabasesSubmit = async () => {
        if (!selectedDatabases.moments || !selectedDatabases.projects || !selectedDatabases.lifeAreas) {
            setError('Bitte wähle alle erforderlichen Datenbanken aus');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await onSave({
                token: token.trim(),
                databases: selectedDatabases
            });
        } catch (err) {
            setError('Die Konfiguration konnte nicht gespeichert werden');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <Space direction="vertical" size="large" className="w-full">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Willkommen bei Momentchen!</h1>
                        {step === 'token' ? (
                            <>
                                <Text>
                                    Um loszulegen, benötigen wir deinen Notion Integration Token.
                                    Du findest ihn unter{' '}
                                    <Link href="https://www.notion.so/my-integrations" target="_blank">
                                        Notion Integrations
                                    </Link>.
                                </Text>

                                <div className="mt-4">
                                    <Input.Password
                                        placeholder="Notion Integration Token"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        onPressEnter={handleTokenSubmit}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <Text>
                                    Super! Jetzt wähle bitte die Datenbanken aus, die du nutzen möchtest:
                                </Text>

                                <div className="mt-4 space-y-4">
                                    <div>
                                        <Text strong>Momente Datenbank</Text>
                                        <Select
                                            className="w-full"
                                            placeholder="Wähle deine Momente Datenbank"
                                            showSearch
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                            value={selectedDatabases.moments}
                                            onChange={(value) => setSelectedDatabases(prev => ({
                                                ...prev,
                                                moments: value
                                            }))}
                                            options={databases.map(db => ({
                                                label: db.title,
                                                value: db.id
                                            }))}
                                        />
                                    </div>

                                    <div>
                                        <Text strong>Projekte Datenbank</Text>
                                        <Select
                                            className="w-full"
                                            placeholder="Wähle deine Projekte Datenbank"
                                            showSearch
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                            value={selectedDatabases.projects}
                                            onChange={(value) => setSelectedDatabases(prev => ({
                                                ...prev,
                                                projects: value
                                            }))}
                                            options={databases.map(db => ({
                                                label: db.title,
                                                value: db.id
                                            }))}
                                        />
                                    </div>

                                    <div>
                                        <Text strong>Lebensbereiche Datenbank</Text>
                                        <Select
                                            className="w-full"
                                            placeholder="Wähle deine Lebensbereiche Datenbank"
                                            showSearch
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                            value={selectedDatabases.lifeAreas}
                                            onChange={(value) => setSelectedDatabases(prev => ({
                                                ...prev,
                                                lifeAreas: value
                                            }))}
                                            loading={databases.length === 0}
                                            options={databases.map(db => ({
                                                label: db.title,
                                                value: db.id,
                                            }))}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {error && (
                        <Alert
                            message={error}
                            type="error"
                            showIcon
                        />
                    )}

                    <Button
                        type="primary"
                        onClick={step === 'token' ? handleTokenSubmit : handleDatabasesSubmit}
                        loading={isLoading}
                        block
                    >
                        {step === 'token' ? 'Token validieren' : 'Setup abschließen'}
                    </Button>

                    {step === 'databases' && (
                        <Button
                            type="link"
                            onClick={() => setStep('token')}
                            block
                        >
                            Zurück zur Token-Eingabe
                        </Button>
                    )}
                </Space>
            </Card>
        </div>
    );
};