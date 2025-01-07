import "./App.css";
import {MomentTemplate} from "./components/templates/moment.template";
import {NotionSetup} from "./components/molecules/setup.molecule";
import {useNotion} from "./notion.ts";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {ThemeProvider} from "./components/providers/theme.provider";

const queryClient = new QueryClient()

function _App() {
    const { needsSetup, isLoading, saveNotionConfig } = useNotion();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 dark:text-white">
            <p>Laden...</p>
        </div>;
    }

    if (needsSetup) {
        return <NotionSetup onSave={saveNotionConfig} />;
    }

    return (
        <main className="dark:bg-gray-900 min-h-screen">
            <MomentTemplate />
        </main>
    );
}

export default function () {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <_App/>
                <ReactQueryDevtools initialIsOpen={false} />
            </ThemeProvider>
        </QueryClientProvider>
    );
};