import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

import PayMintLogo from "../../assets/main-pages/logoIcon.jpg"

const LogoIcon = ({ className, imgClassName }: { className?: string, imgClassName?: string }) => {
    return (
        <Link className={cn(className)} to={"/"} >
            <img className={cn("object-contain w-auto h-14 max-w-[180px]", imgClassName)} src={PayMintLogo} alt="PayMint" />
        </Link>
    )
}

export default LogoIcon 