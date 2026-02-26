import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-2xl font-bold tracking-tight text-white">
        {title}
      </h1>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
}
