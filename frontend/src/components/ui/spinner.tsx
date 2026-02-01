
export function Spinner({ className }: { className?: string }) {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-b-4 border-t-4 border-black animate-spin"></div>
                <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-b-4 border-t-4 border-black animate-ping opacity-20"></div>
            </div>
        </div>
    )
}
