
"use client";

import { Separator } from "@radix-ui/react-separator";
import { SideBarItem } from "./SideBarItem";
import { dataAdminSideBar, dataGeneralSideBar } from "./SideBarRoutes.data";

export function SideBarRoutes() {
    return (
        <div className="flex flex-col justify-between h-full ">
            <div>
                <div className="p-2 md:p-6 ">
                    <p className="nb-2 text-slate-500">GENERAL</p>
                    {dataGeneralSideBar.map((item) => (
                        <SideBarItem key={item.label} item={item}/>
                    ))}
                </div>
                <Separator/>
                <div className="p-2 md:p-6 ">
                    <p className="nb-2 text-slate-500">ADMIN</p>
                    {dataAdminSideBar.map((item) => (
                        <SideBarItem key={item.label} item={item}/>
                    ))}
                </div>
            </div>
            <div>
                <Separator/>
                
                <footer className="p-3 mt-3 text-center border-t">
                    2024. TechnologyAdvanceSolutions- All rights reserved
                </footer>
            </div>
        </div>
                
  );
}
