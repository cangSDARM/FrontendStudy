## Core Concept

Conflict-free Replicated Data Types
[Brief intro](https://www.youtube.com/watch?v=B5NULPSiOGw)

Goal: Strong Eventual Consistency (Convergence)

Minor Goal:
- *Commutative*: Order of Replication dose not matter
- *Idempotent*: How many times of Replication dose not matter

Not The Goal:
- Consensus: Pick one of the changes to apply, and throw others

## Math: Order Theory

ref: https://youtu.be/OOlnp2bZVRs

An *Order*(Comparable) is a binary relation ≤ on a set S. note: `<S, ≤>`

An order `<S, ≤>` is *Total Order* iff for every a and b in S

if a and b arent comparable in `<S, ≤>`, note: `a ‖ b`

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

## JSON

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
D become the left-sub-array:

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

P1:              P2:             P3:
        A                   A               A
        B                   B               B
        C                  C               C
    D       E          D       E       D       E
    Z       Y          Z       Y       Z       Y
2       1          2       1       2       1
now array is: [A,B,C,D,Z,2,1,E,Y]
```

## Causality

Causality means events in chian logically precede one anther

Causality is in each TimeData as a vector clock^(has a dependencies metadata of the TimeData) of size #actors, Queue TimesData until causal chain is complete then apply

## Best Practice in SubCategory

TextEdit: https://zed.dev/blog/crdts

## Application/Package

javascript:
https://automerge.org/docs/quickstart/
[Yjs](https://youtu.be/0l5XgnQ6rB4)
