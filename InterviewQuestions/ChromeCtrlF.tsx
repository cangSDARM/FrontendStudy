import { CloseOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import Lo from "lodash";
import React from "react";

type CtrlFCtx = {
  text: string;
  open: boolean;
  highlight: (
    text: string,
    ref: React.RefCallback<HTMLElement>
  ) => React.ReactNode;
};
const CtrlFContext = React.createContext<CtrlFCtx>({
  highlight: (t) => t,
  text: "",
  open: false,
});

const cycle = (num: number, max: number) => {
  if (num < 0) return max;
  if (num > max) return 0;
  return num;
};

const attribute = "data-ctrlf-idx";

/**
 * 
@example
```tsx
const [ctrlFOpen, setCtrlFOpen] = React.useState(false);

<CtrlFProvider
  open={false}
  onOpenChange={setCtrlFOpen}
  className={classes["ctrlf"]}
  highlight={(m, attrs) => {
    return (
      <span {...attrs} className={classes["highlight"]}>
        {m}
      </span>
    );
  }}
></CtrlFProvider>
```
 */
export const CtrlFProvider: React.FC<
  React.PropsWithChildren<
    {
      highlight: (
        text: string,
        attrs: {
          ref: React.RefCallback<HTMLElement>;
          ["data-ctrlf-highlighted"]: string;
        }
      ) => React.ReactNode;
      onOpenChange?: (open: boolean) => void;
      open?: boolean;
    } & React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >
  >
> = ({ children, highlight, open, onOpenChange, ...props }) => {
  const [text, setText] = React.useState("");
  const [index, setIndex] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const trueHighlight: CtrlFCtx["highlight"] = (text, ref) => {
    const dataCtrlFHighlighted = "data-ctrlf-highlighted";
    const extraRef: typeof ref = (ele) => {
      ref(ele);

      const attr = ele?.getAttribute(attribute) || "";
      if (Number.parseInt(attr) === index - 1) {
        ele?.setAttribute(dataCtrlFHighlighted, "true");
      } else {
        ele?.setAttribute(dataCtrlFHighlighted, "false");
      }
    };
    return highlight(text, { ref: extraRef, [dataCtrlFHighlighted]: "false" });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceInput = React.useCallback(
    Lo.throttle((e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value);
      setTimeout(
        () =>
          setCount(document.querySelectorAll(`[${attribute}]`)?.length || 0),
        10
      );
    }, 50),
    []
  );

  React.useEffect(() => {
    if (!open) {
      setCount(0);
      setText("");
    }
  }, [open]);

  return (
    <CtrlFContext.Provider
      value={{ text, highlight: trueHighlight, open: !!open }}
    >
      {children}
      <div {...props} data-enabled={open}>
        <Input
          allowClear
          autoFocus
          type="text"
          size="small"
          variant="borderless"
          value={text}
          onChange={debounceInput}
          count={{ show: count !== 0, max: count, strategy: () => index }}
        />
        <span role="separator" />
        <div className="btn-group">
          <Button
            type="text"
            icon={<UpOutlined />}
            onClick={() => {
              setIndex((i) => cycle(i - 1, count));
            }}
          />
          <Button
            type="text"
            icon={<DownOutlined />}
            onClick={() => {
              setIndex((i) => cycle(i + 1, count));
            }}
          />
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => {
              onOpenChange?.(false);
            }}
          />
        </div>
      </div>
    </CtrlFContext.Provider>
  );
};

/**
 * 高亮显示搜索到的
 * 
@example
```tsx
<CtrlFRenderer
  content={record.content.length > 50 ? record.content.substring(0, 50) + "..." : record.content}
/>
```
 */
export const CtrlFRenderer: React.FC<{
  content: string;
}> = ({ content }) => {
  const { text, highlight, open } = React.useContext(CtrlFContext);

  return React.useMemo(() => {
    if (text.trim().length === 0) return content;
    if (!open) return content;

    const fragments: React.ReactNode[] = [];
    const reg = new RegExp(text, "g"),
      tLen = text.length;

    let matched: RegExpExecArray | null = null,
      prevIdx = 0,
      prevText = "";

    while (((matched = reg.exec(content)), matched)) {
      prevText = content.substring(prevIdx, matched.index);
      fragments.push(
        <React.Fragment key={matched.index}>{prevText}</React.Fragment>
      );
      fragments.push(
        <React.Fragment key={text + matched.index}>
          {highlight(matched[0], (ele) => {
            const elements = document.querySelectorAll(`[${attribute}]`);
            for (let i = 0; i < elements.length; i++) {
              if (ele === elements[i]) {
                ele?.setAttribute(attribute, i.toString());
                return;
              }
            }
            ele?.setAttribute(attribute, elements.length.toString());
          })}
        </React.Fragment>
      );
      prevIdx = matched.index + tLen;
    }
    fragments.push(content.substring(prevIdx));

    return fragments;
  }, [content, text, highlight, open]);
};
