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

export const getNotionForegroundColor = (notionColor: string = 'default'): string => {
    const backgroundColor = getNotionBackgroundColor(notionColor);

    const isLightBackground = backgroundColor === 'yellow';

    return isLightBackground ? 'black' : 'white';
}

export const getNotionBackgroundColor = (notionColor: string = 'default'): string => {
    const colorMap: Record<string, string> = {
        blue: 'blue',
        brown: 'brown',
        green: 'green',
        yellow: 'yellow',
        red: 'red',
        orange: 'orange',
        purple: 'purple',
        pink: 'pink',
        gray: 'gray',
        default: 'default'
    };
    return colorMap[notionColor] || 'default';
};