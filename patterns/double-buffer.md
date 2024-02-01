# double-buffer pattern

以下情况都满足时，使用这个模式就很恰当：

- 需要维护一些被增量修改的状态
- 在修改到一半的时候，状态可能会被外部请求
- 需要防止请求状态的外部代码知道内部的工作方式
- 需要读取状态，而且不想等着修改完成

```typescript
class Framebuffer {
  constructor(private WIDTH: number, private HEIGHT: number) {
    this.clear();
  }

  private pixels = [];

  clear() {
    this.pixels = new Array(this.WIDTH * this.HEIGHT).fill(WHITE);
  }

  draw(x: number, y: number) {
    pixels_[WIDTH * y + x] = BLACK;
  }

  getPixels() {
    return this.pixels;
  }
}

class Scene {
  current = new Framebuffer(160, 250);
  next = new Framebuffer(160, 250);

  private swap() {
    const tp = this.current;
    this.current = this.next;
    this.next = tp;
  }

  draw() {
    this.next.clear();
    this.next.draw(1, 2);
    this.next.draw(1, 2);
    //...
    this.swap();
  }

  getBuffer() {
    return this.current;
  }
}
```
