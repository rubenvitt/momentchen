import "./App.css";
import {MomentTemplate} from "./components/templates/moment.template";
import {NotionSetup} from "./components/molecules/setup.molecule.tsx";
import {useNotion} from "./notion.ts";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";

const queryClient = new QueryClient()

function _App() {
    const { needsSetup, isLoading, saveNotionConfig } = useNotion();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">
            <p>Laden...</p>
        </div>;
    }

    if (needsSetup) {
        return <NotionSetup onSave={saveNotionConfig} />;
    }

    return (
        <main>
            <MomentTemplate />
        </main>
    );
}

export default function () {
    return (
        <QueryClientProvider client={queryClient}>
            <_App/>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
};
