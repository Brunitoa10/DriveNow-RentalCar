import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SideBarItemProps } from "./SideBarItem.types";

export function SideBarItem(props: SideBarItemProps) {
  const { item } = props;
  const { href, icon: Icon, label } = item;
  const pathname = usePathname();
  const activePath = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        `flex gap-x-2 mt-2 text-slate-700 text-sm items-center hover:bg-slate-300/20 p-2 rounded-lg cursor-pointer`,
        activePath && "bg-slate-400/20"
      )}
    >
      <Icon className="w-5 h-5" strokeWidth={1} />
      {label}
    </Link>
  );
}