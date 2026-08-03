import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import CustomButton from "@/components/CustomButton";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ICountry, IState } from "@/routes/auth-pages/UserDetails";
import { fetchCountries, updateProfile } from "@/lib/api/authApi";
import { FormEvent, useState } from "react";
import api from "@/lib/api/axios";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

const AccountSettingForm = () => {
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [showStateDropdown, setShowStateDropdown] = useState(false);

    const {user, accessToken, refreshToken, setAuthData} = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState(user?.username || "");
    const [country, setCountry] = useState(user?.country);
    const [state, setState] = useState(user?.state);

    const {
        data: countries,
        isLoading: fetchingCountries,
        error: countriesError
    } = useQuery<ICountry[], Error>({
        queryKey: ["countries"],
        queryFn: fetchCountries,
    })
    const selectedCountry = country && countries && countries.length ? countries.find((ctry) => ctry.name === country) : null;

    const fetchStates = async () => {
        const res = await api.get(
            `/reference/states/${selectedCountry?.id}?page=1&limit=1000`
        )
        return res.data.data;
    }

    const {
        data: states,
        isLoading: fetchingStates,
        error: statesError
    } = useQuery<IState[], Error>({
        queryKey: ["states", selectedCountry?.id],
        queryFn: fetchStates,
        enabled: !!selectedCountry?.id && !!countries
    })

    const {mutate, isPending: updatingProfile} = useMutation({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            const userDetails = data?.userDetails;
            console.log({userDetails})
            setAuthData(userDetails, accessToken!, refreshToken!)
            toast.success("Profile updated successfully!")
            navigate("/dashboard/settings")
        },
        onError: (error: AxiosError) => {
            const errData = error.response?.data as { message?: string };
            if(errData.message){
                return toast.error(errData.message)
            }
            toast.error("Something went wrong, please try again")
        }
    })

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        if(!country || !state || !username) return
        mutate({country, state, username})
    }

  return (
    <form onSubmit={onSubmit} className="mt-6 md:mt-14">
        <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full">
                <label className="text-[#344054] text-sm font-medium" htmlFor="firstname">First name</label>
                <input defaultValue={user?.firstname} id="firstname" disabled type="text" className="w-full outline-0 bg-white p-4 border border-[#D0D5DD] shadow-[#1018280D] text-[#344054] text-sm rounded-md mt-1 focus:border-[var(--aqua)] disabled:pointer-events-none disabled:bg-[#F0F2F5] disabled:text-[#98A2B3] transition" />
            </div>
            <div className="w-full">
                <label className="text-[#344054] text-sm font-medium" htmlFor="lastname">Last name</label>
                <input defaultValue={user?.lastname} id="lastname" disabled type="text" className="w-full outline-0 bg-white p-4 border border-[#D0D5DD] shadow-[#1018280D] text-[#344054] text-sm rounded-md mt-1 focus:border-[var(--aqua)] disabled:pointer-events-none disabled:bg-[#F0F2F5] disabled:text-[#98A2B3] transition" />
            </div>
        </div>

        <div className="w-full mt-5">
            <label className="text-[#344054] text-sm font-medium" htmlFor="email">Email address</label>
            <input defaultValue={user?.email} id="email" disabled type="email" className="w-full outline-0 bg-white p-4 border border-[#D0D5DD] shadow-[#1018280D] text-[#344054] text-sm rounded-md mt-1 focus:border-[var(--aqua)] transition disabled:pointer-events-none disabled:bg-[#F0F2F5] disabled:text-[#98A2B3]" />
        </div>

        <div className="w-full mt-5">
            <label className="text-[#344054] text-sm font-medium" htmlFor="username">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" id="username" className="w-full outline-0 bg-white p-4 border border-[#D0D5DD] shadow-[#1018280D] text-[#344054] text-sm rounded-md mt-1 focus:border-[var(--aqua)] transition" />
        </div>

            {/*Country select  */}
            <div className="mt-5 w-full">
                <label className="text-[#344054] text-sm font-medium" htmlFor="country">Country</label>
                <Popover open={showCountryDropdown} onOpenChange={setShowCountryDropdown}>
                    <PopoverTrigger asChild>
                        <CustomButton
                            disabled={fetchingCountries}
                            aria-expanded={open}
                            className="w-full !h-12 mt-1.5 border-[0.5px] border-[#D0D5DD] rounded-lg py-2.5 px-3.5 bg-white outline-none hover:border-[var(--aqua)] font-normal text-[#667085] flex items-center justify-between text-sm"
                        >
                            {country
                                ? selectedCountry ? <div className="text-[#344054] flex items-center gap-2">
                                    <img src={selectedCountry.flag} className="size-5 rounded-full object-cover" />
                                    <span>{selectedCountry.name}</span>
                                </div> : <Loader2 className="animate-spin size-4" />
                                : `${fetchingCountries ? "Loading countries..." : "Select country"}`}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </CustomButton>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[90vw] md:max-w-[546px]">
                        <Command className="">
                            <CommandInput className="" placeholder="search..." />
                            <CommandList className="w-full px-3.5">
                                <CommandEmpty>No country found.</CommandEmpty>
                                <CommandGroup className="px-0">
                                {countries && countries.length && countries.map((ctry) => (
                                    <CommandItem
                                        className={cn("text-[#344054] justify-between", country && ctry.name === country && "font-medium")}
                                        key={ctry.id}
                                        value={ctry.name}
                                        onSelect={(currentValue) => {
                                            setCountry((prev) => {
                                                const newCountry = prev === currentValue ? "" : currentValue;
                                                setState("");
                                                return newCountry;
                                            })
                                            setShowCountryDropdown(false)
                                        }}
                                    >
                                        <div className="text-[#344054] flex items-center gap-2">
                                            <img src={ctry.flag} className="size-5 rounded-full bg-gray-100 object-cover" />
                                            <span>{ctry.name}</span>
                                        </div>
                                        <Check
                                            className={cn(
                                            "mr-2 h-4 w-4",
                                            country === ctry.name ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                {countriesError && <p className="text-red-500 mt-1 text-sm">Failed to load countries. Please refresh.</p>}
            </div>
            {/*state select  */}
            <div className="mt-5 w-full">
                <label className="text-[#344054] text-sm font-medium" htmlFor="state">State</label>
                <Popover open={showStateDropdown} onOpenChange={setShowStateDropdown}>
                    <PopoverTrigger asChild>
                        <CustomButton
                            disabled={fetchingStates || !country}
                            aria-expanded={open}
                            className="w-full !h-12 mt-1.5 border-[0.5px] border-[#D0D5DD] rounded-lg py-2.5 px-3.5 bg-white outline-none hover:border-[var(--aqua)] font-normal text-[#667085] flex items-center justify-between text-sm"
                        >
                            {state
                                ? <span className="text-[#344054]">{state}</span>
                                : `${fetchingStates ? "Loading states..." : "Select state"}`}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </CustomButton>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[90vw] md:max-w-[546px]">
                        <Command className="">
                            <CommandInput className="" placeholder="search..." />
                            <CommandList className="w-full px-3.5">
                                <CommandEmpty>No states found.</CommandEmpty>
                                <CommandGroup className="px-0">
                                {states && states.map((st) => (
                                    <CommandItem
                                        className={cn("text-[#344054] justify-between", state && st.name === state && "font-medium")}
                                        key={st.id}
                                        value={st.name}
                                        onSelect={(currentValue) => {
                                            setState((prev) => prev === currentValue ? "" : currentValue)
                                            setShowStateDropdown(false)
                                        }}
                                    >
                                        {st.name}
                                    <Check
                                        className={cn(
                                        "mr-2 h-4 w-4",
                                        state === st.name ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                {statesError && <p className="text-red-500 mt-1 text-sm">Failed to load states. Please refresh.</p>}
            </div>

            <div className="mt-5 w-full flex items-center justify-end">
                <CustomButton isLoading={updatingProfile}  disabled={!username || !country || !state || updatingProfile} className="w-full md:w-[120px]">Save</CustomButton>
            </div>
    </form>
  )
}

export default AccountSettingForm;