import MastercardIcon from "@/assets/dashboard/Mastercard.png"
import PayPass from "@/assets/dashboard/PayPass icon.png"
import { Link } from "react-router-dom"

const CreditCard = () => {
  return (
    <Link to="/dashboard/virtual-card" className="w-full h-[110px] md:h-[152px] grid grid-cols-4 rounded-lg overflow-hidden text-white hover:opacity-90 hover:scale-[103%] transition">
        <div className="col-span-3 bg-[#344054] p-3 md:p-4 flex flex-col justify-between">
            <h3 className="text-lg md:text-xl font-bold">₦ 1,650,000</h3>

            <div className="flex justify-between items-end">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-8">
                        <h4 className="text-xs md:text-sm uppercase font-medium tracking-widest">OLIVIA RHYE</h4>
                        <span className="text-xs md:text-sm font-medium">06/24</span>
                    </div>
                    <p className="text-sm md:text-base font-medium tracking-widest">1234 1234 1234 1234</p>
                </div>
                <div className="w-7 md:w-9 h-4 md:h-6 grid place-items-center bg-white/10">
                    <img src={MastercardIcon} className="object-cover w-5 md:w-6 h-2.5 md:h-3.5" />
                </div>
            </div>
        </div>
        <div className="col-span-1 bg-gradient-to-b from-purple-400 to-red-300 relative">
            <img src={PayPass} className="size-4 absolute top-4 right-4" />
        </div>
    </Link>
  )
}

export default CreditCard 