import { navlinks, footerLinks } from "@/lib/constants" 
import Logo from "../navbar/Logo"
import { Link, NavLink } from "react-router-dom"

import Twitter from "../../assets/main-pages/Twitter.png"
import LinkedIn from "../../assets/main-pages/LinkedIn.png"
import Facebook from "../../assets/main-pages/Facebook.png"
import { Instagram } from "lucide-react"

const socialLinks = [
  {
    id: 1,
    icon: Twitter,
    href:"/"
  },
  {
    id: 2,
    icon: LinkedIn,
    href:"/"
  },
  {
    id: 3,
    icon: Facebook,
    href:"/"
  },
]

const Footer = () => {
  return (
    <footer className="bg-white w-screen">
      <div className="w-[90%] md:w-[80%] mx-auto py-10 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start w-full gap-8">
          <div className="max-w-[320px]">
            <Logo />
            <p className="text-[var(--ink)] mt-4">Enjoy amazing bill payment experiences that create more happy in the world.</p>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-end w-full max-md:justify-between justify-end md:gap-12 gap-8">
            <nav className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 max-md:mt-4">
                    {
                        navlinks.map(({id, label, href}) => (
                           <NavLink key={`nav-${id}`} className={({isActive}) =>
                              !isActive ? "text-[var(--ink)] font-normal hover:text-[var(--aqua)] transition" : "text-[var(--aqua)] font-medium"
                          } to={href}>{label}</NavLink>
                        ))
                    }            
            </nav>
            <nav className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 max-md:mt-2">
                    {
                        footerLinks.map(({id, label, href}) => (
                           <NavLink key={`foot-${id}`} className={({isActive}) =>
                              !isActive ? "text-[var(--ink)] font-normal hover:text-[var(--aqua)] transition" : "text-[var(--aqua)] font-medium"
                          } to={href}>{label}</NavLink>
                        ))
                    }            
            </nav>
            <div className="flex md:hidden items-center gap-6 mt-4">
                {
                  socialLinks.map(({id, icon, href}) => (
                    <Link key={id} to={href}>
                    <img className="size-4 object-cover" src={icon} />
                    </Link>
                  ))
                }
                <Link className="hover:scale-110 transition" to="/">
                  <Instagram className="size-4 text-[#667085]" />  
                </Link>
            </div>
          </div>
        </div>
        {/* Divider line */}
        <div className="bg-[#EAECF0] h-[1px] mt-8 md:mt-16 mb-8 max-md:bg-transparent" />
        <div className="flex items-center justify-center md:justify-between">
          <p className="text-[#667085]">© 2077 PayMint Ltd. All rights reserved.</p>
          <div className="hidden md:flex items-center gap-4 md:gap-6">
              {
                socialLinks.map(({id, icon, href}) => (
                  <Link className="hover:scale-110 transition" key={id} to={href}>
                    <img className="size-4 object-cover" src={icon} />
                  </Link>
                ))
              }
               <Link className="hover:scale-110 transition" to="/">
                  <Instagram className="size-4 text-[#667085]" />  
                </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer