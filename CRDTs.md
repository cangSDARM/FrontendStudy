- [Core Concept](#core-concept)
- [Math: Order Theory](#math-order-theory)
- [两种类型](#两种类型)
  - [State-Based CRDT (CvRDT)](#state-based-crdt-cvrdt)
  - [Order-Based CRDT (CmRDT)](#order-based-crdt-cmrdt)
    - [因果 Causality](#因果-causality)
    - [JSON](#json)
    - [Last-writer-win Set (LWWSet)](#last-writer-win-set-lwwset)
  - [CmRDT 和 CvRDT 是等价的](#cmrdt-和-cvrdt-是等价的)
- [Best Practice in SubCategory](#best-practice-in-subcategory)
- [Application/Package](#applicationpackage)

## Core Concept

Conflict-free Replicated Data Types
[Brief intro](https://www.youtube.com/watch?v=B5NULPSiOGw)

目标: 强最终一致性 (可收敛的)

小目标:
- *可交换性Commutative*: Order of Replication dose not matter
- *幂等性Idempotent*: How many times of Replication dose not matter

不考虑:
- 共识性Consensus: Pick one of the changes to apply, and throw others

## Math: Order Theory

ref: https://youtu.be/OOlnp2bZVRs

An *Order*(Comparable) is a binary relation ≤ on a set S. note: `<S, ≤>`

An order `<S, ≤>` is *Total Order* iff for every a and b in S

if a and b aren't comparable in `<S, ≤>`, note: `a ‖ b`

An *Upper Bound* of in `P ⊆ S`, is a v in S that's `a ≤ v` to every a in P.

A *Least Upper Bound* v of `P = { a, b }`, is the *join* of a and b. note: `a ∨ b = v`.
and only max one v exist.

joins obey 3 laws:
- Associativity: `(a ∨ b) ∨ c = a ∨ (b ∨ c)`, apply order dosent matter
- Commutativity: `a ∨ b = b ∨ a`, subsequences order dosent matter
- Idempotent: `a ∨ a = a`, apply times dosent matter

if `a ∨ b` exists for all `{ a, b } ⊆ S`, then S is a *join semi-lattice*

CRDTs' goal is creating a join semi-lattice by merging difference change-chains into joins.
the final state is the final least upper bound

## 两种类型

### State-Based CRDT (CvRDT)

副本之间通过传递自己的 state，并进行 merge 操作来达到一致性

需求:
- state 在 ≤ 上满足 joins
- 对任意的 state s, 本地更新条件 u，都有 s ≤ update(s, u)
- merge(s, s') 得到的是两个远程节点的 Upper Bound

### Order-Based CRDT (CmRDT)

副本之间通过传递彼此缺失的 op，并进行 apply_op 来达到最终一致性

需求:
- 所有的 Op 最终都会被发布到每一个副本上
- 保证可能出现并行的 Op 都满足交换律(不管先应用哪个 Op，最终状态都一致)
- 在 apply_op(state, op) 时需要保证 check_op(state, op) 为 true(保证因果成立)

#### 因果 Causality

Causality means events in chain logically precede one anther

Causality is in each TimeData as a vector clock^(has a dependencies metadata of the TimeData) of size #actors, Queue TimesData until causal chain is complete then apply

##### Lamport Timestamp

用于在分布式环境中判断事件发生先后

算法过程:
- 每个节点维护一个 counter
- 本地每发生一个事件就将 counter + 1，并将事件的时间戳设置为 counter 值
- 每当节点发送一个消息，就将本地 counter + 1，并将最新的 counter 值附带在消息上
- 当节点收到消息后，让自己的 `counter = Math.max(counter, message.counter) + 1`

#### JSON

ref: https://www.youtube.com/watch?v=vBU70EjwGfw

Commutative Replication works for all data type of JSON

Only 4 Operations Needed

string: `set`, `delete`
number: `set`, `delete`, `increment`
object: `set`, `delete`
array: `set`, `delete`, `insert`

`increment`, `insert`, `delete` are commutative, `set` is convergent^(All actors converge to the same state but values during convergence may differ, last-writer-wins determines convergence)

be able to resolve conflicts and race-conditions, need metadata like uuid(version) for each type operations.

`delete` need a special metadata, will ignore all operations after. Then it require a special set operation to reborn it.

object nested fields need their own metadata

array-ordering is a reverse-linked-list to resolve race-conditions. last-writer-wins let the array become a left-sub-array^(when you do depth-first traversal will be the first child):

```text
P2 insert E at Time1
P3 insert D at Time2,
D become the left-sub-array(last-writer-wins):

P1:             P2:             P3:
    A               A               A
    B               B               B
    C               C               C
D       E       D       E       D       E
now array is: [A,B,C,D,E]

then P2 insert Y below E,
P3 insert Z below D:

P1:             P2:             P3:
    A               A               A
    B               B               B
    C               C               C
D       E       D       E       D       E
Z       Y       Z       Y       Z       Y
now array is: [A,B,C,D,Z,E,Y]

then P1 insert 1 below Z at T1,
P2 insert 2 below Z at Time2:

P1:              P2:               P3:
        A                  A                 A
        B                  B                 B
        C                  C                 C
    D       E          D       E         D       E
    Z       Y          Z       Y         Z       Y
2       1          2       1         2       1
now array is: [A,B,C,D,Z,2,1,E,Y]
```

#### Last-writer-win Set (LWWSet)

```ts
interface Op {
  time: number;
  pid: number;
  type: "add" | "remove";
  value: string;
}

type State = Map<string, Op>;
type ProcessState = { counter: number; state: State };
const state_zero: State = new Map();
const process_state_zero: ProcessState = {counter: 0, state: state_zero};

function apply(state: ProcessState, op: Op): ProcessState {
  const new_state: ProcessState = {
    counter: Math.max(state.counter, op.time) + 1,
    state: new Map(state.state),
  };
  if (!new_state.state.has(op.value)) {
    new_state.state.set(op.value, op);
  } else {
    const old_op = state.state.get(op.value);
    if (
      old_op.time < op.time ||
      (old_op.time === op.time && old_op.pid < op.pid)
    ) {
      new_state.state.set(op.value, op);
    }
  }

  return new_state;
}

function check_state(state: State, op: Op) {
  return true;
}

// 判断 LWWSet 是否含有某个值
function has(state: State, v: string): boolean {
  return state.get(v)?.type === "add";
}

// 插入 v 到 LWWSet
function add(state: ProcessState, v: string): ProcessState {
  return apply(state, {
    time: state.counter,
    pid: getPid(),
    type: "add",
    value: v,
  });
}

// 删除 LWWSet 中的 v
function remove(state: ProcessState, v: string): ProcessState {
  return apply(state, {
    time: state.counter,
    pid: getPid(),
    type: "remove",
    value: v,
  });
}
```

### CmRDT 和 CvRDT 是等价的

CmRDT 和 CvRDT 是可以互相转换的。思路为：

- 通过 CmRDT 构建 CvRDT 的方式为:
  - 将新的 State-based Object 的 state 定义为一个二元组(s, M)，s 和 CmRDT 的内部状态一致，M 是 CmRDT 的内部 Op 的集合。
  - 将新的 State-based Object 的 merge 操作定义为 `merge((s, M), (s', M')) = apply_ops(s, M' - M)`
- 通过 CvRDT 构建 CmRDT 的方式为：
  - 将新的 Op-based object 的 Op 定义为 CvRDT 的 State
  - 将 apply_op 的操作定义为 `apply_op(state, op) = merge(state, op)`，而 merge 是服从对称性的操作，从而我们能够得到一个 CmRDT

## Best Practice in SubCategory

TextEdit: https://zed.dev/blog/crdts

## Application/Package

javascript:
https://automerge.org/docs/quickstart/
[Yjs](https://youtu.be/0l5XgnQ6rB4)
