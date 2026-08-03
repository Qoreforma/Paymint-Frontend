import RecipientDetailForm from "./RecipientDetailForm"

const RecipientDetails = () => {
  return (
    <section className="w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="size-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            </div>
            <div>
                <h2 className="text-xl font-display font-semibold text-slate-800">Withdraw funds</h2>
                <p className="text-slate-500 text-sm mt-0.5">Enter the details below to withdraw funds</p>
            </div>
        </div>
        <RecipientDetailForm />
    </section>
  )
}

export default RecipientDetails