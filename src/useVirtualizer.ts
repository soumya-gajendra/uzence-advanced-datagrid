import { useMemo } from 'react';

interface UseVirtualizerProps {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  scrollTop: number;
}

export const useVirtualizer = ({
  itemCount,
  itemHeight,
  containerHeight,
  scrollTop,
}: UseVirtualizerProps) => {
 
  const totalHeight = itemCount * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight));
  const visibleNodeCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(itemCount, startIndex + visibleNodeCount + 5);
  const virtualItems = useMemo(() => {
    const items = [];
    for (let i = startIndex; i < endIndex; i++) {
      items.push({
        index: i,
        offsetTop: i * itemHeight,
      });
    }
    return items;
  }, [startIndex, endIndex, itemHeight]);

  return { virtualItems, totalHeight };
};