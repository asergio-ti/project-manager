export type DocumentStatus = 'pending' | 'in-progress' | 'completed';
export type DocumentPhase = 'DVP' | 'DRS' | 'DAS';

export interface Document {
    id: string;
    name: string;
    phase: DocumentPhase;
    status: DocumentStatus;
    progress: number;
    content?: {
        title: string;
        description: string;
        sections: {
            title: string;
            content: string;
            subsections?: {
                title: string;
                content: string;
            }[];
        }[];
    };
}
