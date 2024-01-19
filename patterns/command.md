# Command Pattern

- [例子](#例子)
- [习题](#习题)
- [参见](#参见)

将行为封装为标准对象，以解耦行为消费者和行为生产者

也是一种回调的面向对象实现

## 例子

从时间方面考虑，"undo"和"redo"功能

```typescript
class CommandHistory {
  constructor(private limitation = 1000) {}

  private history: ICommand[] = [];
  private curCommand = 0;
  private sizeOf = 0;

  async do(cmd: ICommand) {
    await cmd.execute();

    // delete all old timeline;
    //...

    this.history.push(cmd);
    this.sizeOf += 1;

    // keep limitation
    //...
  }

  async undo() {
    if (this.curCommand >= 0) {
      const succeed = await this.history[this.curCommand].undo();
      if (succeed) {
        this.curCommand -= 1;
      }
    }
  }

  async redo() {
    const redoOf = this.curCommand + 1;
    if (redoOf < this.sizeOf && redoOf >= 0) {
      this.history[redoOf].execute();
      this.curCommand += 1;
    }
  }
}

class ActorCommand<ActorData> implements ICommand {
  constructor(private actor: IActor<ActorData>, private newData: ActorData) {}

  private oldData: ActorData | undefined;
  private curData: ActorData | undefined;

  async execute() {
    this.oldData = this.actor.state;
    this.curData = this.newData;

    this.actor.onChange(this.curData);
  }

  async undo() {
    this.curData = this.oldData;

    this.actor.onChange(this.curData);
  }
}

class TransformCommand<Data> implements ICommand {
  constructor(private oldData: Data, private newData: Data) {}
  private data: Data;

  async execute() {
    this.oldData = this.data;
    this.data = this.newData;
  }

  async undo() {
    this.data = this.oldData;
  }
}

/// using
const actor = new SomeActor();
const cmdHistory = new CommandHistory();

cmdHistory.do(new ActorCommand(actor, "1234"));
cmdHistory.do(new TransformCommand("123", "1234"));
cmdHistory.undo();
cmdHistory.undo();
cmdHistory.redo();
```

## 习题

<details>
<summary>
如何以这种模式实现游戏的按键功能控制？
</summary>

```typescript
class JumpCommand implements ICommand {
  async execute(actor: IActor): Promise<void> {
    actor.jump();
  }
}
class FireCommand implements ICommand {
  async execute(actor: IActor): Promise<void> {
    actor.fire();
  }
}

class InputHandler {
  handleInput(input: InputEvent): ICommand {
    if (isPressed(input, Button_X)) return this.jump;
    if (isPressed(input, Button_Y)) return this.fire;

    return null;
  }

  jump: ICommand = new JumpCommand();
  fire: ICommand = new FireCommand();
}

/// using
const character: IActor = new Character();
const enemy = character.controllable("boss");
const handler: InputHandler = new InputHandler();
const cmd = handler.handleInput(input);
if (cmd) {
  // 可以让玩家控制游戏中的任何角色，只需向命令传入不同的角色
  cmd.execute(character || enemy);
}
```

</details>

## 参见

- 最终可能会得到很多不同的命令类。为了更容易实现这些类，定义一个具体的基类，包含一些能定义行为的高层方法，往往会有帮助。这将命令的主体 execute 转到*子类沙箱*中。
- 有些命令是无状态的纯粹行为。在这种情况下，有多个实例是在浪费内存，因为所有的实例是等价的。可以用*享元模式*解决。
- 在上面的例子中，我们明确地指定哪个角色会处理命令。在某些情况下，特别是当对象模型分层时，也可以不这么简单粗暴。对象可以响应命令，或者将命令交给它的从属对象。如果你这样做，你就完成了一个*职责链模式*。
