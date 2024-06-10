import React, { useRef, useEffect, useState, useCallback } from "react";
import styles from "./components.module.css";
import { useVirtualScroll } from "../lib/hooks";

const VirtualList = ({
  items,
  itemHeight,
  listHeight,
  overscan = 3,
  renderItem,
  ...props
}) => {
  const listRef = useRef(null);
  const [paddingRight, setPaddingRight] = useState(0);
  const { virtualItems, totalHeight } = useVirtualScroll({
    itemHeight,
    itemsCount: items?.length,
    listHeight,
    getScrollElement: useCallback(() => listRef.current, []),
  });

  useEffect(() => {
    const checkScrollbar = () => {
      if (listRef.current) {
        const hasScrollbar =
          listRef.current.scrollHeight > listRef.current.clientHeight;
        setPaddingRight(hasScrollbar ? 0 : 10);
      }
    };
    checkScrollbar();
    const observer = new MutationObserver(checkScrollbar);
    if (listRef.current) {
      observer.observe(listRef.current, { childList: true, subtree: true });
    }
    return () => {
      observer.disconnect();
    };
  }, [listRef]);
  return (
    <ul
      className={styles.list}
      ref={listRef}
      role="listbox"
      style={{ height: listHeight, paddingRight }}
      {...props}
    >
      <div style={{ height: totalHeight }} className={styles.listWrapper}>
        {virtualItems.map((option) => {
          const item = items[option.index];
          return renderItem(item, option.offsetTop);
        })}
      </div>
    </ul>
  );
};

export default VirtualList;
