# Command Pattern

将行动封装为标准对象，以实现对行动的管理

例如，从时间方面考虑，"undo"和"redo"功能

```typescript
class CommandHistory {
  constructor(private limitation = 1000) {}

  private history: ICommand[] = [];
  private curCommand = 0;
  private sizeOf = 0;

  private get lastIndex() {
    return this.sizeOf - 1;
  }

  async do(cmd: ICommand) {
    await cmd.execute();

    if (this.curCommand < this.lastIndex) {
      // delete all old timeline;
      this.history.splice(this.curCommand);
      this.sizeOf = this.curCommand + 1;
    }

    this.history.push(cmd);
    this.sizeOf += 1;

    // keep limitation
    if (this.sizeOf > this.limitation) {
      this.history.splice(0, this.sizeOf - this.limitation);
    }
    this.curCommand = this.lastIndex;
  }

  async undo() {
    if (this.curCommand >= 0) {
      const succeed = await this.history[this.curCommand].undo();
      if (succeed) {
        this.curCommand -= 1;

        return true;
      }
    }

    return false;
  }

  async redo() {
    const redoOf = this.curCommand + 1;
    if (redoOf < this.sizeOf && redoOf >= 0) {
      this.history[redoOf].execute();
      this.curCommand += 1;

      return true;
    }

    return false;
  }

  get timeline() {
    return this.history.slice(0, this.curCommand + 1);
  }
}

class ActorCommand<ActorData> implements ICommand {
  constructor(private actor: IActor<ActorData>, private newData: ActorData) {}

  get type(): string {
    return "base";
  }

  private oldData: ActorData | undefined;
  private curData: ActorData | undefined;

  get data() {
    return this.curData;
  }

  async execute(): Promise<void> {
    this.oldData = this.actor.state;
    this.curData = this.newData;

    this.actor.onChange(this.curData);
  }

  async undo(): Promise<boolean> {
    this.curData = this.oldData;

    this.actor.onChange(this.curData);

    return true;
  }
}

class TransformCommand<Data> implements ICommand {
  constructor(private oldData: Data, private newData: Data) {}
  private data: Data;

  async execute(): Promise<void> {
    this.oldData = this.data;
    this.data = this.newData;
  }

  async undo(): Promise<boolean> {
    this.data = this.oldData;

    return true;
  }
}

class StrActor {
  state: string;

  onChange(newState: string) {
    this.state = newState;
  }
}

/// using
const actor = new StrActor();
const cmdHistory = new CommandHistory();

cmdHistory.do(new ActorCommand(actor, "1234"));
cmdHistory.do(new TransformCommand("123", "1234"));
cmdHistory.undo();
cmdHistory.undo();
cmdHistory.redo();
```
