  
  export default function Input({ type, value, setValue, placeholder }) {
    return (
      <input
        className="rounded-md border-2 border-black p-[10px] font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all focus:translate-x-[3px] focus:translate-y-[3px] focus:shadow-none"
        type={type}
        name="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
        }}
        aria-label={placeholder}
      />
    )
  }
  