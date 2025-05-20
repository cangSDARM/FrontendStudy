import React from "react";
import { message, Button } from "antd";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function createCollaborateSlot(key: string) {
  const updateHandles: (() => void)[] = [];
  const MsgKey = "collaboration-" + key;

  async function collaborate<T extends { conflict: boolean }>(
    data: T,
    content?: React.ReactElement,
  ): Promise<T | null> {
    if (data && data.conflict) {
      message.destroy(MsgKey);
      message.warn({
        key: MsgKey,
        content: (
          <>
            {content ?? content}
            <Button
              type="link"
              onClick={() => {
                updateHandles.forEach((fn) => fn());
                message.destroy(MsgKey);
              }}
            >
              立即刷新
            </Button>
          </>
        ),
        duration: 0,
      });

      return null;
    }

    return data;
  }

  const Slot: React.FC<
    React.PropsWithChildren<{ onUpdate?: () => void | Promise<void> }>
  > = ({ children, onUpdate }) => {
    const [key, _update] = React.useState(0);
    const update = React.useCallback(async () => {
      _update(Date.now());
      await onUpdate?.();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onUpdate]);

    if (!updateHandles.includes(update)) updateHandles.push(update);

    React.useEffect(
      () => () => {
        const index = updateHandles.findIndex((fn) => fn === update);
        if (index > -1) updateHandles.splice(index, 1);
      },
      [update],
    );

    // key prop, force **remount**(not rerender) children
    return <React.Fragment key={key}>{children}</React.Fragment>;
  };

  return {
    // rerender react component
    collaborate,
    // the rerendered component
    Slot: React.memo(Slot),
    // the key
    MsgKey,
  };
}

export const TabSlot = createCollaborateSlot("tab");
