// Helper functions
export const resolveRelation = (relationId: string | undefined, projectsQuery: any, lifeAreasQuery: any) => {
    if (!relationId) return null;

    const project = projectsQuery.data?.find((p: any) => p.id === relationId);
    if (project) return {title: project.title, type: 'project'};

    const lifeArea = lifeAreasQuery.data?.find((la: any) => la.id === relationId);
    if (lifeArea) return {title: lifeArea.title, type: 'lifeArea'};

    return null;
};
export const getNotionColor = (notionColor: string = 'default'): string => {
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