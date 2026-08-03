import Logo from "./Logo"
import NavLinks from "./NavLinks"
import AuthButtons from "../Authentication/AuthButtons"

const DesktopNav = () => {
  return (
    <div className="w-[90%] md:w-[80%] mx-auto hidden md:flex justify-between items-center h-full">
        <div className="w-[200px]">
            <Logo />
        </div>
        <div className="flex-1 flex justify-center">
            <NavLinks />
        </div>
        <div className="w-[200px] flex justify-end">
            <AuthButtons />
        </div>
    </div>
  )
}

export default DesktopNav