# State pattern

## Finite State Machine

- 拥有状态机所有可能状态的集合
- 状态机同时只能在一个状态
- 每个状态都有一系列的转移，每个转移与输入和另一状态相关

例子：最简单的 FSM 实现，switch

```typescript
enum State {
  Idle,
  Loading,
  Fetching,
  Done,
}

const state = State.Idle;
switch (state) {
  case State.Idle:
    state = State.Loading;
    break;
  case State.Loading: {
    if (isGettingData(data)) {
      state = State.Fetching;
    }
    break;
  }
  case State.Done:
    if (!error) state = State.Idle;
    break;
  default:
    state = State.Idle;
}
```

<details>
<summary>

如何以 oop 形式实现？

</summary>

```typescript
abstract class State {
  abstract handle(input: Input): State | undefined;
  abstract enter();
  abstract exit();
}
class JumpState extends State {
  handle(input: Input): State | undefined {
    if (input === JUMP_BUTTON) {
      return new JumpState();
    }
  }
}
class IdleState extends State {
  handle(input: Input): State | undefined {
    return new IdleState();
  }
}

let state = new IdleState();
const newState = state.handle(input);
if (newState) {
  state.exit();
  newState.enter();

  state = newState;
}
```

</details>

## 并发状态机

解决状态机的组合。方式是手动组合

```typescript
let state = new IdleState();
let equipment = new EquipmentState();
const newState = state.handle(input);
const newEquip = equipment.handle(input);
if (newState) {
  state.exit();
  newState.enter();

  newEquip.enter();
  newEquip.enter();

  state = newState;
  equipment = newEquip;
}
```

## 分层状态机

解决状态机的组合。方式是继承

```typescript
class OnGroundState extends State {
  handle(input: Input) {
    if (input == PRESS_B) {
      // 跳跃……
    } else if (input == PRESS_DOWN) {
      // 俯卧……
    }
  }
}
class DuckingState extends OnGroundState {
  handle(input: Input) {
    if (input == RELEASE_DOWN) {
      // 站起……
    } else {
      // 没有处理输入，返回上一层
      super.handle(heroine, input);
    }
  }
}
```

or……状态栈

```typescript
class OnGroundState extends State {
  constructor(private stack: Stack) {}
  handle(input: Input) {
    if (input == PRESS_B) {
      // 跳跃……
    } else if (input == PRESS_DOWN) {
      // 俯卧……
    }
  }
}
class DuckingState extends State {
  constructor(private stack: Stack) {}
  handle(input: Input) {
    if (input == RELEASE_DOWN) {
      // 站起……
    } else {
      // 没有处理输入，返回上一层
      stack.pop(heroine, input);
    }
  }
}
stack.push(DuckingState(stack));
stack.handle(input);
```

## 下推自动机

解决有限状态机的历史寻找问题。方式是栈帧

- 将新状态压入栈中。“当前的”状态总是在栈顶，所以你能转到新状态。但它让之前的状态待在栈中而不是销毁它。
- 弹出最上面的状态。这个状态会被销毁，它下面的状态成为新状态。
