import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

export function useVirtualScroll({
  itemHeight,
  itemsCount,
  overscan = 3,
  listHeight,
  getScrollElement,
}) {
  const [scrollTop, setScrollTop] = useState(0);

  useLayoutEffect(() => {
    const scrollElement = getScrollElement();
    if (!scrollElement) {
      return;
    }

    const handleScroll = () => {
      const scrollTop = scrollElement.scrollTop;
      setScrollTop(scrollTop);
    };

    handleScroll();

    scrollElement.addEventListener("scroll", handleScroll);

    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [getScrollElement]);

  const { virtualItems, startIndex, endIndex } = useMemo(() => {
    const rangeStart = scrollTop;
    const rangeEnd = scrollTop + listHeight;

    let startIndex = Math.floor(rangeStart / itemHeight);
    let endIndex = Math.ceil(rangeEnd / itemHeight);

    startIndex = Math.max(0, startIndex - overscan);
    endIndex = Math.min(itemsCount - 1, endIndex + overscan);
    const virtualItems = [];

    for (let index = startIndex; index <= endIndex; index++) {
      virtualItems.push({
        index,
        offsetTop: index * itemHeight,
      });
    }
    return { virtualItems, startIndex, endIndex };
  }, [scrollTop, listHeight, itemsCount]);

  const totalHeight = itemHeight * itemsCount;

  return {
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
  };
}


export function useClickOutside(handler, ...elementsRef) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (elementsRef.every(ref => ref.current && !ref.current.contains(event.target))) {
        handler()
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [...elementsRef]);
}

export function useFetch(url) {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUrl = async () => {
      setLoading(true);
      try {
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUrl();
  }, [url]);

  return { data, loading, error };
};

export default useFetch;
