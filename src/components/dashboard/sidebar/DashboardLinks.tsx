import { dashboardLinks } from "@/lib/constants";
import { Link, useLocation } from "react-router-dom";
import SidebarLinkWithSubCat from "./SidebarLinkWithSubCat";
import { cn } from "@/lib/utils";

const DashboardLinks = ({closeSidebar}: {closeSidebar?: () => void}) => {
const location = useLocation();

  return (
    <nav className="flex flex-col h-full overflow-x-hidden overflow-y-auto scroll-bar-y">
        {
            dashboardLinks.map(({id, label, link, subCategories, icon: Icon}) => {

                if(subCategories){
                    return <SidebarLinkWithSubCat closeSidebar={closeSidebar} key={id} id={id} label={label} link={link} subCategories={subCategories} icon={Icon} />
                } else {
                    const isActive = location.pathname === link;

                    return (
                        <Link 
                            key={id} 
                            {...(closeSidebar && {onClick: closeSidebar})}
                            className={cn("relative group block", isActive ? "text-[var(--brand)] font-semibold bg-slate-50" : "text-slate-500 hover:text-[var(--brand)] hover:bg-slate-50/50 transition duration-300")} 
                            to={link}
                        >
                            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--brand)] rounded-r-md shadow-[1px_0_4px_rgba(11,69,200,0.4)]"></div>}
                            <div className="w-full h-full px-5 py-3.5 flex items-center gap-3">
                                <Icon className={cn("size-5", isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100")} />
                                <span className="text-sm tracking-wide">{label}</span>
                            </div>
                        </Link>
                    )}
            })
        }
    </nav>
  )
}

export default DashboardLinks