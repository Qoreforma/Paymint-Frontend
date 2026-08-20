import Layers from "../assets/main-pages/Layers.png"
import Sisyphus from "../assets/main-pages/sisyphus.png"
import Circooles from "../assets/main-pages/circooles.png"
import Catalog from "../assets/main-pages/catalog.png"
import Quotient from "../assets/main-pages/quotient.png"

import Bills from "../assets/main-pages/bills.png"
import Referrals from "../assets/main-pages/referrals.png"
import StaticAccount from "../assets/main-pages/static_account.png"
import VirtualCard from "../assets/main-pages/virtual_cards.png"

import Users from "../assets/main-pages/users.svg"
import Chart from "../assets/main-pages/chart.svg"
import Fast from "../assets/main-pages/fast.svg"
import Flag from "../assets/main-pages/flag.svg"
import Heart from "../assets/main-pages/heart.svg"
import Smiley from "../assets/main-pages/smiley.svg"

import MailIcon from "@/assets/main-pages/mail_icon.png"

import AvatarGroup from "@/assets/dashboard/Avatar Groups.png"

import { GoHome } from "react-icons/go";
import { FaRegFileLines } from "react-icons/fa6";
import { VscGift } from "react-icons/vsc";
import { RiSettings2Line } from "react-icons/ri";
import { LuSend } from "react-icons/lu";
import { LuDownload, LuPlus  } from "react-icons/lu";
import { IoIosAddCircleOutline } from "react-icons/io";

import Virtual from "@/assets/dashboard/virtual.svg";
import Flutterwave from "@/assets/dashboard/flutter.svg";
import OpayIcon from "@/assets/dashboard/opay.svg";

import MtnIcon from "@/assets/dashboard/mtn.svg"
import AirtelIcon from "@/assets/dashboard/airtel.svg"
import nineMobile from "@/assets/dashboard/9mobile.svg"
import glo from "@/assets/dashboard/globacom.svg"

import { LuBell, LuBookOpenText, LuLink, LuMail } from "react-icons/lu";
import { IoPhonePortraitOutline } from "react-icons/io5";

// NAVBAR
export const navlinks = [
    {
        id: 1,
        label: "Home",
        href:"/"
    },
    {
        id: 2,
        label: "About us",
        href:"/about"
    },
    {
        id: 3,
        label: "Contact us",
        href:"/contact"
    },
]

export const footerLinks = [ 
    {
        id: 1,
        label: "Privacy Policy",
        href:"/privacy-policy"
    },
    {
        id: 2,
        label: "FAQs",
        href:"/faqs"
    },
    {
        id: 3,
        label: "Terms & Conditions",
        href:"/terms"
    },
]

// EXTERNAL PAGES
export const partnerships = [
    {
        id: 1,
        image: Layers,
        width: 146
    },
    {
        id: 2,
        image: Sisyphus,
        width: 169
    },
    {
        id: 3,
        image: Circooles,
        width: 183
    },
    {
        id: 4,
        image: Catalog,
        width: 160
    },
    {
        id: 5,
        image: Quotient,
        width: 187
    },
]

export const features = [
    {
        id: 1,
        image: Bills,
        title: "Seamless bill payment.",
        description: "Our mission is to empower our users with the ability to manage their mobile and digital needs effortlessly. We aim to bridge the gap between technology and convenience, providing a platform that’s not only user-friendly but also reliable and secure. With [Your App Name], you're in control, whether you’re at home, at work, or on the go."
    },
    {
        id: 2,
        image: StaticAccount,
        title: "Get static account.",
        description: "Our mission is to empower our users with the ability to manage their mobile and digital needs effortlessly. We aim to bridge the gap between technology and convenience, providing a platform that’s not only user-friendly but also reliable and secure. With [Your App Name], you're in control, whether you’re at home, at work, or on the go."
    },
    {
        id: 3,
        image: Referrals,
        title: "Refer to earn.",
        description: "Our mission is to empower our users with the ability to manage their mobile and digital needs effortlessly. We aim to bridge the gap between technology and convenience, providing a platform that’s not only user-friendly but also reliable and secure. With [Your App Name], you're in control, whether you’re at home, at work, or on the go."
    },
    {
        id: 4,
        image: VirtualCard,
        title: "Virtual card that works.",
        description: "Our mission is to empower our users with the ability to manage their mobile and digital needs effortlessly. We aim to bridge the gap between technology and convenience, providing a platform that’s not only user-friendly but also reliable and secure. With [Your App Name], you're in control, whether you’re at home, at work, or on the go."
    },
]

export const whyUsePayMint = [
    {
        id: 1,
        icon: Users,
        title: "Care about our customers",
        content: "Understand what matters to our users. Give them what they need to do solve their needs."
    },
    {
        id: 2,
        icon: Heart,
        title: "Excellent customer service",
        content: "Our ever available service team are always ready to attend to your needs."
    },
    {
        id: 3,
        icon: Chart,
        title: "Pride in what we do",
        content: "Value quality and integrity in everything we do. At all times. No exceptions."
    },
    {
        id: 4,
        icon: Smiley,
        title: "Happy customer reviews",
        content: "Our good reviews from our happy and satisfied customers will always speak for us!"
    },
    {
        id: 5,
        icon: Flag,
        title: "No red flags",
        content: "Red flags? Shady offers? Hidden charges? We don’t do that here. 100% Plain and secure."
    },
    {
        id: 6,
        icon: Fast,
        title: "Fast and reliable service",
        content: "Our platform is designed to process your  transactions quickly and accurately."
    },
]

export const faqsContent = [
    {
        id: 1,
        question: "Is there a free trial available?",
        answer: "Yes, you can try us for free for 30 days. If you want, we’ll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible."
    },
    {
        id: 2,
        question: "Can I change my plan later?",
        answer: "Yes, you can try us for free for 30 days. If you want, we’ll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible."
    },
    {
        id: 3,
        question: "What is your cancellation policy?",
        answer: "Yes, you can try us for free for 30 days. If you want, we’ll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible."
    },
    {
        id: 4,
        question: "Can other info be added to an invoice?",
        answer: "Yes, you can try us for free for 30 days. If you want, we’ll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible."
    },
    {
        id: 5,
        question: "How does billing work?",
        answer: "Yes, you can try us for free for 30 days. If you want, we’ll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible."
    },
    {
        id: 6,
        question: "How do I change my account email?",
        answer: "Yes, you can try us for free for 30 days. If you want, we’ll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible."
    },
]

export const faqCards = [
    {
        id: 1,
        icon: MailIcon,
        question: "How do I change my account email?",
        answer: "You can change the email address associated with your account by going to untitled.com/account from a laptop or desktop."
    },
    {
        id: 2,
        icon: MailIcon,
        question: "How do I change my account email?",
        answer: "You can change the email address associated with your account by going to untitled.com/account from a laptop or desktop."
    },
    {
        id: 3,
        icon: MailIcon,
        question: "How do I change my account email?",
        answer: "You can change the email address associated with your account by going to untitled.com/account from a laptop or desktop."
    },
    {
        id: 4,
        icon: MailIcon,
        question: "How do I change my account email?",
        answer: "You can change the email address associated with your account by going to untitled.com/account from a laptop or desktop."
    },
    {
        id: 5,
        icon: MailIcon,
        question: "How do I change my account email?",
        answer: "You can change the email address associated with your account by going to untitled.com/account from a laptop or desktop."
    },
    {
        id: 6,
        icon: MailIcon,
        question: "How do I change my account email?",
        answer: "You can change the email address associated with your account by going to untitled.com/account from a laptop or desktop."
    },

]

// DASHBOARD
export const dashboardLinks = [
    {
        id: 1,
        label: "Dashboard",
        link: "/dashboard",
        subCategories: null,
        icon: GoHome,
    },
    {
        id: 3,
        label: "History",
        link: "/dashboard/history",
        subCategories: null,
        icon: FaRegFileLines,
    },
    {
        id: 4,
        label: "Affiliate",
        link: "/dashboard/affiliate",
        subCategories: null,
        icon: VscGift,
    },
    {
        id: 5,
        label: "Settings",
        link: "/dashboard/settings",
        subCategories: null,
        icon: RiSettings2Line,
    },
]

export const quickActions = [
    {
        id: 1,
        label: "Transfer Funds",
        href: "/dashboard/transfer-funds",
        icon: LuSend
    },
    {
        id: 2,
        label: "Withdraw Funds",
        href: "/dashboard/withdraw-funds",
        icon: LuDownload
    },
    {
        id: 3,
        label: "Add Funds",
        href: "/dashboard/add-funds",
        icon: LuPlus
    },
    {
        id: 4,
        label: "Static Account",
        href: "/dashboard/static-account",
        icon: IoIosAddCircleOutline
    },
]

export const otherServices = [
    {
        id: 4,
        href: "/dashboard/affiliate",
        icon: AvatarGroup,
        label: "Invite and earn",
        bgColor: "#E3EFFC",
    },
]



import RadioIcon from "@/assets/dashboard/radio-mobile.svg";

export const otherServicesMobile = [
    {
        id: 5,
        href: "/dashboard/services/mobile-money",
        title: "Payment",
        subTitle: "Make mobile payments easily.",
        icon: RadioIcon
    },
]

import Rss from "@/assets/dashboard/rss.svg";
import Globe from "@/assets/dashboard/globe.svg"
import Zap from "@/assets/dashboard/zap.svg"
import HardDrive from "@/assets/dashboard/hard-drive.svg"
import Tv from "@/assets/dashboard/tv.svg"
import Key from "@/assets/dashboard/key.svg"



export const appServices = [
    {
        id: 1,
        label: "Airtime",
        subtitle: "Top up any network",
        icon: Rss,
        href: "/dashboard/services/airtime",
        category: "Telecom",
        featured: true,
        iconColor: "text-blue-600",
        bgColor: "bg-blue-50/50",
        borderColor: "border-blue-100",
    },
    {
        id: 2,
        label: "Data",
        subtitle: "Cheap data bundles",
        icon: Globe,
        href: "/dashboard/services/data",
        category: "Telecom",
        featured: true,
        iconColor: "text-green-600",
        bgColor: "bg-green-50/50",
        borderColor: "border-green-100",
    },
    {
        id: 3,
        label: "Electricity",
        subtitle: "Pay electricity bills",
        icon: Zap,
        href: "/dashboard/services/electricity",
        category: "Utilities",
        featured: true,
        iconColor: "text-amber-500",
        bgColor: "bg-amber-50/50",
        borderColor: "border-amber-100",
    },
    {
        id: 4,
        label: "Betting",
        subtitle: "Fund your account",
        icon: HardDrive,
        href: "/dashboard/services/betting",
        category: "Entertainment",
        featured: true,
        iconColor: "text-red-500",
        bgColor: "bg-red-50/50",
        borderColor: "border-red-100",
    },
    {
        id: 5,
        label: "TV/Cable",
        subtitle: "Pay for cable TV",
        icon: Tv,
        href: "/dashboard/services/cable",
        category: "Entertainment",
        featured: true,
        iconColor: "text-indigo-600",
        bgColor: "bg-indigo-50/50",
        borderColor: "border-indigo-100",
    },
    {
        id: 6,
        label: "E-PIN",
        subtitle: "Generate e-pins",
        icon: Key,
        href: "/dashboard/services/epin",
        category: "Utilities",
        featured: true,
        iconColor: "text-purple-600",
        bgColor: "bg-purple-50/50",
        borderColor: "border-purple-100",
    },
    {
        id: 15,
        label: "Airtime Print",
        subtitle: "Print airtime vouchers",
        icon: Rss,
        href: "/dashboard/services/airtime-print",
        category: "Print Services",
        featured: false,
        iconColor: "text-teal-600",
        bgColor: "bg-teal-50/50",
        borderColor: "border-teal-100",
    },
    {
        id: 16,
        label: "Data Print",
        subtitle: "Print data vouchers",
        icon: Globe,
        href: "/dashboard/services/data-print",
        category: "Print Services",
        featured: false,
        iconColor: "text-cyan-600",
        bgColor: "bg-cyan-50/50",
        borderColor: "border-cyan-100",
    },
    // {
    //     id: 13,
    //     label: "Intl Airtime",
    //     subtitle: "Global top up",
    //     icon: Rss,
    //     href: "/dashboard/services/international-airtime",
    //     category: "International",
    //     featured: true,
    //     iconColor: "text-rose-500",
    //     bgColor: "bg-rose-50/50",
    //     borderColor: "border-rose-100",
    // },
    // {
    //     id: 14,
    //     label: "Intl Data",
    //     subtitle: "Global data bundles",
    //     icon: Globe,
    //     href: "/dashboard/services/international-data",
    //     category: "International",
    //     featured: true,
    //     iconColor: "text-fuchsia-600",
    //     bgColor: "bg-fuchsia-50/50",
    //     borderColor: "border-fuchsia-100",
    // },
]

export const paymentMethods = [
    {
        id: "virtual",
        label: "Virtual Account",
        icon: Virtual,
        bank_name: "Virtual bank",
        account_number: "0021117795",
        account_name: "FABSPAY - ANNA KESHINRO"
    },
    {
        id: "opay",
        label: "Opay",
        icon: OpayIcon,
        bank_name: "Opay Digital Services",
        account_number: "7060809021",
        account_name: "Anna Keshinro-CHECKOUT"
    },
    {
        id: "flutter",
        label: "Flutterwave",
        icon: Flutterwave,
        bank_name: "Flutterwave",
        account_number: "0026577795",
        account_name: "FLUTTER - ANNA KESHINRO"
    },
] as const

export const NetworkProviders = [
    {
        id: 1,
        name: "mtn",
        logo: MtnIcon
    },
    {
        id: 2,
        name: "airtel",
        logo: AirtelIcon
    },
    {
        id: 3,
        name: "9mobile",
        logo: nineMobile
    },
    {
        id: 4,
        name: "globacom",
        logo: glo
    },
]

import Glodropdown from "@/assets/dashboard/glo-dropdown.png"
import Mtndropdown from "@/assets/dashboard/mtn-dropdown.png"
import Airteldropdown from "@/assets/dashboard/airtel-dropdown.png"
import nineMobiledropdown from "@/assets/dashboard/9mobile-dropdown.png"

export const NetworkProvidersDropdown = [
    {
        label: "Glo",
        logo: Glodropdown,
        textColor: "#066006",
        value: "glo"
    },
    {
        label: "MTN",
        logo: Mtndropdown,
        textColor: "#B8AA2C",
        value: "mtn"
    },
    {
        label: "9mobile",
        logo: nineMobiledropdown,
        textColor: "#008000",
        value: "9mobile"
    },
    {
        label: "Airtel",
        logo: Airteldropdown,
        textColor: "#FF0000",
        value: "airtel"
    },
]

export const settingsData = [
    {
        id: 1,
        title: "Account",
        path: "account",
        subTitle: "View and make changes to your account",
        hasVerifiedTag: true,
        icon: LuMail
    },
    {
        id: 2,
        title: "Security",
        path: "security",
        subTitle: "Security options for your account",
        hasVerifiedTag: false,
        icon: LuBell
    },
    {
        id: 3,
        title: "Bank info",
        path: "bank-info",
        subTitle: "Bank accounts connected to your PayMint account",
        hasVerifiedTag: false,
        icon: LuLink
    },
    {
        id: 4,
        title: "Support",
        path: "support",
        subTitle: "Contact our support 24/7 team",
        hasVerifiedTag: false,
        icon: LuBookOpenText
    },
    {
        id: 5,
        title: "FAQs",
        path: "faqs",
        subTitle: "Get answers to some frequently asked questions",
        hasVerifiedTag: false,
        icon: IoPhonePortraitOutline
    },
]