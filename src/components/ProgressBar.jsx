function ProgressBar({ currentStep }) {
  // Step labels for display
  const steps = [
    { number: 1, label: 'Employee Input' },
    { number: 2, label: 'Risk Analysis' },
    { number: 3, label: 'Human Review' },
    { number: 4, label: 'Output Check' },
  ]

  return (
    <div className="max-w-6xl mx-auto mb-8">
      {/* Progress circles and connecting lines */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            {/* Circle indicator */}
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold transition
                ${currentStep >= step.number 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-gray-400'
                }
              `}
            >
              {step.number}
            </div>
            
            {/* Connecting line (not shown after last step) */}
            {index < steps.length - 1 && (
              <div
                className={`
                  w-24 h-1 mx-2 transition
                  ${currentStep > step.number ? 'bg-blue-500' : 'bg-gray-700'}
                `}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step labels below circles */}
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        {steps.map((step) => (
          <span key={step.number} className="w-32 text-center">
            {step.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default ProgressBar