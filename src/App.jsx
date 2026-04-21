import { useState } from 'react'
import Header from './components/Header'
import ProgressBar from './components/ProgressBar'
import EmployeePortal from './components/EmployeePortal'
import RiskAnalysis from './components/RiskAnalysis'
import HumanReview from './components/HumanReview'
import OutputVerification from './components/OutputVerification'

function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [userPrompt, setUserPrompt] = useState('')
  const [decision, setDecision] = useState(null)
  const [riskTier, setRiskTier] = useState(null)

  const handleRestart = () => {
    setCurrentStep(1)
    setUserPrompt('')
    setDecision(null)
    setRiskTier(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
      
      <Header />
      <ProgressBar currentStep={currentStep} />

      <div className="max-w-6xl mx-auto bg-slate-800/50 backdrop-blur rounded-xl p-4 md:p-8 border border-slate-700">
        
        {/* Screen 1: Employee Portal */}
        {currentStep === 1 && (
          <EmployeePortal
            prompt={userPrompt}
            setPrompt={setUserPrompt}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {/* Screen 2: Risk Analysis */}
        {currentStep === 2 && (
          <RiskAnalysis
            prompt={userPrompt}
            onNext={(tier) => { setRiskTier(tier); setCurrentStep(3) }}
            onAutoApprove={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {/* Screen 3: Human Review */}
        {currentStep === 3 && (
          <HumanReview
            prompt={userPrompt}
            riskTier={riskTier}
            onNext={(selectedDecision) => {
              setDecision(selectedDecision)
              setCurrentStep(4)
            }}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {/* Screen 4: Output Verification */}
        {currentStep === 4 && (
          <OutputVerification
            prompt={userPrompt}
            decision={decision}  // ← PASS decision to OutputVerification
            onBack={() => setCurrentStep(3)}
            onRestart={handleRestart}
          />
        )}

      </div>
    </div>
  )
}

export default App