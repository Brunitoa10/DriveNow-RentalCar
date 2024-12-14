import { LogoDashboard } from "../LogoDashboard";
import { SideBarRoutes } from "../SideBarRoutes";

export default function SideBar() {
  return (
    <div className="h-screen">
        <div className="flex flex-col h-full border-r">
            <LogoDashboard />
            <SideBarRoutes />
        </div>
    </div>
  )
}
