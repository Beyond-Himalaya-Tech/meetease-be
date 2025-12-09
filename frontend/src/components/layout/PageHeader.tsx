import type { ReactNode } from "react";

type Tab = {
  id: number;
  label: string;
};

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  tabs?: Tab[];
  activeTabId?: string;
  onTabChange?: (id: number) => void;
  rightSlot?: ReactNode;
};

const PageHeader = ({
  title,
  subtitle,
  tabs,
  activeTabId,
  onTabChange,
  rightSlot,
}: PageHeaderProps) => {
  return (
    <header className="mb-4 sm:mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
        {rightSlot && <div className="flex-shrink-0">{rightSlot}</div>}
      </div>

      {tabs && tabs.length > 0 && onTabChange && (
        <nav
          aria-label={`${title} sections`}
          className="mt-4 border-b border-gray-200"
        >
          <ul className="flex gap-6 text-sm font-medium text-gray-500">
            {tabs.map((tab) => {
              const active = tab.id === activeTabId;
              return (
                <li key={tab.id}>
                  <button
                    type="button"
                    className={`relative pb-2 ${
                      active
                        ? "text-blue-600"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                    onClick={() => onTabChange(tab.id)}
                  >
                    {tab.label}
                    {active && (
                      <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-blue-600 rounded-full" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
};

export type { PageHeaderProps, Tab };
export default PageHeader;


