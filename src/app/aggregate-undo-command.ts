import { SingleUndoCommand } from './single-undo-command';

export class AggregateUndoCommand {
    constructor(public commands: SingleUndoCommand[]) {
    }
}
