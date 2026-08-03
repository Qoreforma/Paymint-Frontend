import { navlinks } from "@/lib/constants"
import {  NavLink } from "react-router-dom"

const NavLinks = () => {
  return (
    <ul className="flex items-center gap-2">
        {
            navlinks.map(({id, label, href}) => {
                return (
                    <li key={id} >
                        <NavLink className={({isActive}) =>
                            !isActive ? "rounded-[8px] py-3 px-[18px] text-[var(--ink)] font-normal hover:bg-[var(--aqua)0D] transition" : "rounded-[8px] py-3 px-[18px] text-[var(--aqua)] bg-[var(--aqua)0D] font-medium"
                        } to={href}>{label}</NavLink>
                    </li>
                )
            })
        }
    </ul>
  )
}

export default NavLinks