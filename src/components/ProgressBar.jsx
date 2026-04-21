function ProgressBar({ currentStep }) {
  // Step labels for display
  const steps = [
    { number: 1, label: 'Employee Input' },
    { number: 2, label: 'Risk Analysis' },
    { number: 3, label: 'Human Review' },
    { number: 4, label: 'Output Check' },
  ]

  return (
    <div className="max-w-6xl mx-auto mb-6 md:mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`
              w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition
              ${currentStep >= step.number ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}
            `}>
              {step.number}
            </div>
            {index < steps.length - 1 && (
              <div className={`
                w-8 sm:w-16 md:w-24 h-1 mx-1 md:mx-2 transition
                ${currentStep > step.number ? 'bg-blue-500' : 'bg-gray-700'}
              `} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        {steps.map((step) => (
          <span key={step.number} className="w-16 md:w-32 text-center leading-tight">
            {step.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default ProgressBar