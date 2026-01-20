import { useMemo } from "react";

const useModuleFilter = (items, modules) => {
  // module filtering with org package
  const filteredItems = useMemo(() => {
    if (!items || !modules) return [];

    return items
      .map((item) => {
        // Check if parent key is allowed
        const parentMatch = modules.includes(item.key);

        // If children exist, filter them
        let children = [];
        if (item.children) {
          children = item.children.filter((child) => modules.includes(child.key));
        }

        // Keep parent if it matches OR if it has matching children
        if (parentMatch || children.length > 0) {
          return {
            ...item,
            children: children.length > 0 ? children : undefined,
          };
        }

        return null;
      })
      .filter(Boolean); // remove nulls
  }, [items, modules]);

  return filteredItems;
};

export default useModuleFilter;
