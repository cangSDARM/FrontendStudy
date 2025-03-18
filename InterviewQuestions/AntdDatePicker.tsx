import React from "react";
import { DatePicker, zh_CN } from "antd";
import dayjs from "dayjs";

dayjs.locale("zh-cn");

const disableAntdCell = (
  panel: HTMLDivElement,
  num: number[],
  cell: "hour" | "minute" | "second"
) => {
  const panelUl = panel.querySelector(
    `.ant-picker-content > ul.ant-picker-time-panel-column[data-type=${cell}]`
  );

  Array.from(panelUl?.childNodes || []).forEach((child, idx) => {
    if (num.includes(idx)) {
      (child as HTMLElement)?.classList.add(
        "ant-picker-time-panel-cell-disabled"
      );
    } else {
      (child as HTMLElement)?.classList.remove(
        "ant-picker-time-panel-cell-disabled"
      );
    }
  });
};

export const cleanDisabled = (panel: HTMLDivElement | null) => {
  if (!panel) return;

  disableAntdCell(panel, [], "hour");
  disableAntdCell(panel, [], "minute");
  disableAntdCell(panel, [], "second");
};

export const disableTimeBefore = (
  panel: HTMLDivElement,
  startTime: Date,
  candidate?: Date
) => {
  if (!candidate) return;

  const startDate = startTime.getDate();
  const startHours = startTime.getHours();
  const startMinutes = startTime.getMinutes();
  const startSeconds = startTime.getSeconds();

  let disabledHours = Array.from({ length: startHours }, (_, i) => i);

  // antd bug, some date wont sent
  let disabledMinutes: number[] = [];
  let disabledSeconds: number[] = [];

  // only the same day have a concept of before "hh:mm:ss"
  // but due to antd bug, we have to compare before date (it's already disabled)
  if (candidate.getDate() <= startDate) {
    if (candidate.getHours() === startHours) {
      disabledMinutes = Array.from({ length: startMinutes }, (_, i) => i);
      if (candidate.getMinutes() === startMinutes) {
        disabledSeconds = Array.from({ length: startSeconds }, (_, i) => i);
      }
    }
    // means start and end time is same at the certain unit
    if (disabledMinutes.length === 60) {
      disabledMinutes = disabledMinutes.filter((m) => m !== startMinutes);
    }
    if (disabledSeconds.length === 60) {
      disabledSeconds = disabledSeconds.filter((s) => s !== startSeconds);
    }
  } else {
    disabledHours = [];
  }

  disableAntdCell(panel, disabledHours, "hour");
  disableAntdCell(panel, disabledMinutes, "minute");
  disableAntdCell(panel, disabledSeconds, "second");
};

export const disableTimeAfter = (
  panel: HTMLDivElement,
  endTime: Date,
  candidate?: Date
) => {
  if (!candidate) {
    return;
  }

  const endDate = endTime.getDate();
  const endHours = endTime.getHours();
  const endMinutes = endTime.getMinutes();
  const endSeconds = endTime.getSeconds();

  let disabledHours = Array.from(
    { length: 24 - (endHours + 1) },
    (_, i) => endHours + 1 + i
  );

  let disabledMinutes: number[] = [];
  let disabledSeconds: number[] = [];

  // only the same day have a concept of after "hh:mm:ss"
  // but due to antd bug, we have to compare after date (it's already disabled)
  if (candidate.getDate() >= endDate) {
    if (candidate.getHours() === endHours) {
      disabledMinutes = Array.from(
        { length: 60 - (endMinutes + 1) },
        (_, i) => endMinutes + 1 + i
      );
      if (candidate.getMinutes() === endMinutes) {
        disabledSeconds = Array.from(
          { length: 60 - (endSeconds + 1) },
          (_, i) => endSeconds + 1 + i
        );
      }
    }
    // means start and end time is same at the certain unit
    if (disabledMinutes.length === 60) {
      disabledMinutes = disabledMinutes.filter((m) => m !== endMinutes);
    }
    if (disabledSeconds.length === 60) {
      disabledSeconds = disabledSeconds.filter((s) => s !== endSeconds);
    }
  } else {
    disabledHours = [];
  }

  disableAntdCell(panel, disabledHours, "hour");
  disableAntdCell(panel, disabledMinutes, "minute");
  disableAntdCell(panel, disabledSeconds, "second");
};

export const disableDateBefore = (startTime: Date) => (date: dayjs.Dayjs) =>
  date.isBefore(startTime, "d");
export const disableDateAfter = (endTime: Date) => (date: dayjs.Dayjs) =>
  date.isAfter(endTime, "d");

const { RangePicker } = DatePicker;

type Prop = React.ComponentProps<typeof RangePicker>;

const En2Cn = {
  Su: "日",
  Mo: "一",
  Tu: "二",
  Th: "三",
  We: "四",
  Fr: "五",
  Sa: "六",
  Jan: "一月",
  Feb: "二月",
  Mar: "三月",
  Apr: "四月",
  May: "五月",
  Jun: "六月",
  Jul: "七月",
  Aug: "八月",
  Sep: "九月",
  Oct: "十月",
  Nov: "十一月",
  Dec: "十二月",
};
const rename2Cn = (panel?: HTMLDivElement | null) => {
  if (!panel) return;

  const map2 = (ele?: Element | null) => {
    if (ele && (En2Cn as any)[ele.innerHTML]) {
      ele.innerHTML = (En2Cn as any)[ele.innerHTML];
    }
  };

  const trs = panel.querySelectorAll(
    ".ant-picker-date-panel .ant-picker-body table.ant-picker-content thead tr th"
  );

  const month = panel.querySelector(
    ".ant-picker-date-panel .ant-picker-header .ant-picker-month-btn"
  );
  const months = panel.querySelectorAll(
    ".ant-picker-month-panel .ant-picker-body .ant-picker-cell .ant-picker-cell-inner"
  );

  map2(month);

  Array.from(months).forEach((m) => {
    map2(m);
  });
  Array.from(trs).forEach((tr) => {
    map2(tr);
  });
};

/**
 * 
@example
```tsx
<Picker
  value={filters.times}
  // antd bug. onChange will not be called if the value is the same
  onCalendarChange={ds => {
    // @ts-ignore
    setFilters(f => ({ ...f, times: ds[0] && ds[1] ? ds : null }));
  }}
/>
```
 */
const Picker: React.FC<{
  value: Prop["value"];
  onCalendarChange: Prop["onCalendarChange"];
}> = ({ value, onCalendarChange }) => {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const [dateCandidates, setDateCandidate] = React.useState<{
    start?: Date;
    end?: Date;
  }>({
    start: undefined,
    end: undefined,
  });
  const [dateFocus, setDateFocus] = React.useState<"start" | "end">("start");
  const [endDatePickable, setEndDatePickable] = React.useState(true);

  const disabledDate = React.useMemo(
    () =>
      dateFocus === "end" && dateCandidates.start
        ? disableDateBefore(dateCandidates.start)
        : dateFocus === "start" && dateCandidates.end
        ? disableDateAfter(dateCandidates.end)
        : undefined,
    [dateFocus, dateCandidates.start, dateCandidates.end]
  );

  // 正常的 antd 的 disableTime 会导致滚动条跳。这里的 disable 仅仅是样式上禁用。用户还是可以点
  React.useEffect(() => {
    if (!panelRef.current) return;

    dateFocus === "end" && dateCandidates.start
      ? disableTimeBefore(
          panelRef.current,
          dateCandidates.start,
          dateCandidates.end
        )
      : dateFocus === "start" && dateCandidates.end
      ? disableTimeAfter(
          panelRef.current,
          dateCandidates.end,
          dateCandidates.start
        )
      : undefined;
  }, [dateFocus, dateCandidates, panelRef.current]);

  return (
    <RangePicker
      size="small"
      value={value}
      // antd bug
      disabledDate={disabledDate}
      disabled={[false, endDatePickable]}
      onFocus={(_, { range }) => {
        setDateFocus(range || "start");
      }}
      panelRender={(panel: any) => {
        return (
          <div
            ref={(ref) => {
              panelRef.current = ref;
              rename2Cn(ref);
            }}
          >
            {panel}
          </div>
        );
      }}
      //   antd bug. onChange will not be called if the value is the same
      onCalendarChange={(ds, str, info) => {
        if (!ds[0] && !ds[1]) {
          cleanDisabled(panelRef.current);
        }

        if (ds[0]) {
          setEndDatePickable(false);
        } else {
          setEndDatePickable(true);
        }
        // 保证前后“禁用”逻辑（用户虽然点了，但数据变成没点的）
        if (dateFocus === "end" && ds[1] && ds[1]?.isBefore(ds[0])) {
          ds[1] = ds[0];
        }
        if (dateFocus === "start" && ds[0] && ds[0].isAfter(ds[1])) {
          ds[0] = ds[1];
        }

        setDateCandidate({ start: ds[0]?.toDate(), end: ds[1]?.toDate() });
        onCalendarChange?.(ds, str, info);
      }}
      style={{ minWidth: 200 }}
      showTime
    />
  );
};

export default React.memo(Picker);
