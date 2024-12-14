import { NavBarDashboard } from "./dashboard/components/NavBarDashboard";
import SideBar from "./dashboard/components/SideBar/SideBar";

export default function LayoutDashboard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full h-full">
      <div className="hidden h-full xl:block w-80 xl:fixed ">
        <SideBar/>
      </div>
      
        <div className="w-full h-full xl:ml-80 p-4">
          <NavBarDashboard/>
          <div className="p-6 h-max">
              {children}
          </div>
        </div>
    </div>
  );
}