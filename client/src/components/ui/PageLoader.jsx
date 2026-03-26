const PageLoader = ({ label = 'Loading...' }) => {
  return (
    <div className="min-h-[50vh] flex items-center justify-center bg-[#faf8f4]">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1a1814] border-t-[#c8a97e]" />
        <p className="text-sm text-[#7a7570] tracking-[0.01em]">{label}</p>
      </div>
    </div>
  );
};

export default PageLoader;
