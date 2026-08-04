import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageSquare, Phone, Mail, Send, ExternalLink } from "lucide-react";

import { SupportFormSchema } from "@/lib/zodSchemas/dashboard.schema";

type TFormData = z.infer<typeof SupportFormSchema>;

const Support = () => {
  const navigate = useNavigate();

  const {
    register,
    formState: { errors, isSubmitSuccessful },
    handleSubmit,
    reset,
  } = useForm<TFormData>({ resolver: zodResolver(SupportFormSchema) });

  const onSubmit = (data: TFormData) => {
    console.log({ data });
    reset();
  };

  return (
    <div className="w-full max-w-[780px] mx-auto pb-12 pt-2">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate("/dashboard/settings")}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
        >
          ← Back
        </button>
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900">Support</h1>
          <p className="text-slate-500 text-xs mt-0.5">Get help from our team — we're here 24/7</p>
        </div>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <a
          href="https://wa.me/2349079381221"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all"
        >
          <div className="size-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <MessageSquare className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-sm text-slate-900">WhatsApp Chat</p>
            <p className="text-xs text-slate-500 mt-0.5">Chat with us instantly</p>
          </div>
          <ExternalLink className="size-4 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" />
        </a>

        <a
          href="tel:+2349079381221"
          className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="size-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Phone className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-sm text-slate-900">Call an Agent</p>
            <p className="text-xs text-slate-500 mt-0.5">+234 907 938 1221</p>
          </div>
          <ExternalLink className="size-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
        </a>
      </div>

      {/* Mail Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-5">
          <div className="size-10 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center shrink-0">
            <Mail className="size-5" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-sm text-slate-900">Send us a message</h2>
            <p className="text-xs text-slate-500 mt-0.5">We'll respond within 24 hours</p>
          </div>
        </div>

        {isSubmitSuccessful ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="size-14 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
              <Send className="size-7" />
            </div>
            <h3 className="font-display font-bold text-slate-900 text-base mb-1">Message Sent!</h3>
            <p className="text-sm text-slate-500 max-w-xs">
              Thanks for reaching out. Our team will get back to you within 24 hours.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="support-username">
                Username
              </label>
              <input
                {...register("username")}
                id="support-username"
                type="text"
                placeholder="Your PayMint username"
                className="w-full h-11 px-3.5 border border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white outline-none transition-all"
              />
              {errors.username && (
                <p className="text-rose-500 text-xs mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="support-email">
                Email Address
              </label>
              <input
                {...register("email")}
                id="support-email"
                type="email"
                placeholder="your@email.com"
                className="w-full h-11 px-3.5 border border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white outline-none transition-all"
              />
              {errors.email && (
                <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="support-message">
                Message
              </label>
              <textarea
                {...register("message")}
                id="support-message"
                rows={4}
                placeholder="Describe your issue or question in detail…"
                className="w-full px-3.5 py-3 border border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white outline-none transition-all resize-none"
              />
              {errors.message && (
                <p className="text-rose-500 text-xs mt-1">{errors.message.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm h-11 rounded-xl transition-colors cursor-pointer shadow-sm shadow-blue-200"
            >
              <Send className="size-4" />
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Support;