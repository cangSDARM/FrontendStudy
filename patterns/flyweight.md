# Flyweight pattern

将各个类中固定的部分抽出来，实例化为单个对象。以解耦类的变化和不变部分

## 例子

从地形生成方面考虑，实现"不同地块"功能

```typescript
class Terrain {
  constructor(
    private movementCost: int,
    private isWater: bool,
    private texture: Texture,
  ) {}

  getMovementCost() {
    return this.movementCost;
  }
  isWater() {
    return this.isWater;
  }
  getTexture() {
    return this.texture;
  }
}

class World {
  constructor() {}

  private grassTerrain: Terrain;
  private hillTerrain: Terrain;
  private riverTerrain: Terrain;

  private tiles: Terrain[][];

  // 其他代码……
  generateTerrain() {
    // 将地面填满草皮.
    for (let x = 0; x < WIDTH; x++) {
      for (let y = 0; y < HEIGHT; y++) {
        // 加入一些丘陵
        if (random(10) == 0) {
          this.tiles[x][y] = this.hillTerrain;
        } else {
          this.tiles[x][y] = this.grassTerrain;
        }
      }
    }

    // 放置河流
    const x = random(WIDTH);
    for (let y = 0; y < HEIGHT; y++) {
      this.tiles[x][y] = this.riverTerrain;
    }
  }

  getTile(x: number, y: number) {
    return this.tiles[x][y];
  }
}

// using
const newWorld = new World();
newWorld.generateTerrain();

const tile = newWorld.getTile(1, 1);
tile.getMovementCost();
```

## 习题

<details>
<summary>
如何以这种模式实现游戏的森林生成？
</summary>

```typescript
class TreeModel {
  private mesh: Mesh;
  private bark: Texture;
  private leaves: Texture;
}
const ShardModal = new TreeModel();

class Tree {
  constructor(
    private position: Vector,
    private height: number,
    private thickness: number,
    private barkTint: Color,
    private leafTint: Color,
  ) {}

  private model = ShardModal;
}

// using
// GPU 支持实例化渲染
// https://en.wikipedia.org/wiki/Geometry_instancing

const forest = new Array(1500).fill(
  new Tree(
    Vec2(randX, randY),
    randH,
    randT,
    Color3(randR, randG, randB),
    Color3(randR, randG, randB),
  ),
);

GPU.instance(ShardModal);
GPU.render(forest);
```

</details>

## 参见

- 在例子中，我们为每种地形都创建了一个实例然后存储在 World 中。但在多数情况下，不会在一开始就创建所有享元。如果你不能预料哪些是实际上需要的，最好在*需要时才创建*。为了保持共享的优势，当你需要一个时，首先看看是否已经创建了一个相同的实例。如果确实如此，那么只需返回那个实例。像这样隐藏构造指令是*工厂方法*的一个例子。
- 为了返回一个早先创建的享元，需要追踪那些已经实例化的对象池。正如其名，这意味着*对象池*是存储它们的好地方。
- 当使用*状态模式*时，经常会出现一些没有任何特定字段的"状态对象"。其状态的标识和方法都很有用。在这种情况下，可以使用享元模式，然后在不同的状态机上使用相同的对象实例。
