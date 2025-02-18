import { DocumentPhase } from '../domains/documentation/types';

export class TimelineManager {
    private state: any;

    constructor() {
        this.state = {
            currentPhase: 'DVP',
            phases: []
        };
    }

    async navigateToPhase(phase: DocumentPhase): Promise<void> {
        throw new Error('Not implemented');
    }
}
