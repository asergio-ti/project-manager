import { Message, InterviewContext } from './types';

export class ClaudeService {
    private config: any;

    constructor(config: any) {
        this.config = config;
    }

    async sendMessage(
        message: string,
        context?: InterviewContext
    ): Promise<Message> {
        throw new Error('Not implemented');
    }
}
