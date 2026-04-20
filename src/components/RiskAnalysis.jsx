import { useState, useEffect } from 'react'
import { AlertTriangle, Shield, User, Clock, MapPin, FileText } from 'lucide-react'
import Button from './Button'

function RiskAnalysis({ prompt, onNext, onBack }) {
  // Animation states
  const [scanning, setScanning] = useState(true)
  const [riskScore, setRiskScore] = useState(0)
  const [detectedEntities, setDetectedEntities] = useState([])
  const [showBreakdown, setShowBreakdown] = useState(false)

  // Detect sensitive data in prompt
  const detectEntities = () => {
    const entities = []

    if (prompt.match(/[A-Z][a-z]+ [A-Z][a-z]+/)) {
      const name = prompt.match(/[A-Z][a-z]+ [A-Z][a-z]+/)[0]
      entities.push({ type: 'PERSON', value: name, risk: 'high' })
    }

    if (prompt.match(/\d{10}/)) {
      const account = prompt.match(/\d{10}/)[0]
      entities.push({ type: 'ACCOUNT_NUMBER', value: account, risk: 'critical' })
    }

    if (prompt.match(/₹[\d.]+ (?:lakh|crore)/)) {
      const amount = prompt.match(/₹[\d.]+ (?:lakh|crore)/)[0]
      entities.push({ type: 'FINANCIAL_DATA', value: amount, risk: 'high' })
    }

    setDetectedEntities(entities)
  }

  // Animate risk score from 0 to 85
  const animateRiskScore = () => {
    let current = 0
    const target = 85
    const interval = setInterval(() => {
      current += 3
      if (current >= target) {
        current = target
        clearInterval(interval)
        setTimeout(() => setShowBreakdown(true), 500)
      }
      setRiskScore(current)
    }, 50)
  }

  // Simulate AI detection process
  useEffect(() => {
    const scanTimer = setTimeout(() => {
      setScanning(false)
      detectEntities()
      animateRiskScore()
    }, 2000)

    return () => clearTimeout(scanTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Risk level determination
  const getRiskLevel = (score) => {
    if (score >= 70) return { label: 'HIGH RISK', color: 'red', action: 'BLOCK' }
    if (score >= 30) return { label: 'MEDIUM RISK', color: 'yellow', action: 'WARN' }
    return { label: 'LOW RISK', color: 'green', action: 'ALLOW' }
  }

  const riskLevel = getRiskLevel(riskScore)

  // Risk factors breakdown (from your PDF - 6 factors)
  const riskFactors = [
    { name: 'Data Sensitivity', weight: 40, score: 95, icon: Shield },
    { name: 'Employee Authorization', weight: 25, score: 70, icon: User },
    { name: 'Data Volume', weight: 15, score: 60, icon: FileText },
    { name: 'Platform Risk', weight: 10, score: 80, icon: AlertTriangle },
    { name: 'Time/Location', weight: 5, score: 50, icon: Clock },
    { name: 'History', weight: 5, score: 30, icon: MapPin },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-yellow-400" />
        Real-Time Risk Analysis Engine
      </h2>

      {/* Scanning Animation */}
      {scanning ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-lg text-gray-300">Analyzing prompt for sensitive data...</p>
          <p className="text-sm text-gray-500 mt-2">Using NER + Pattern Matching + ML Risk Scoring</p>
        </div>
      ) : (
        <>
          {/* Original Prompt Display */}
          <div className="bg-slate-900 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 mb-2">Original Prompt:</p>
            <p className="text-gray-300 leading-relaxed">
              {prompt.split(' ').map((word, index) => {
                const isDetected = detectedEntities.some(e => word.includes(e.value))
                return (
                  <span
                    key={index}
                    className={isDetected ? 'bg-red-500/30 px-1 rounded' : ''}
                  >
                    {word}{' '}
                  </span>
                )
              })}
            </p>
          </div>

          {/* Detected Entities */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Detected Sensitive Data:</h3>
            <div className="grid grid-cols-1 gap-3">
              {detectedEntities.map((entity, index) => (
                <div key={index} className="bg-slate-900 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500">{entity.type}</span>
                    <p className="text-white font-mono">{entity.value}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-semibold
                    ${entity.risk === 'critical' ? 'bg-red-600' : 'bg-orange-600'}`}>
                    {entity.risk.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Score Display */}
          <div className="bg-slate-900 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Overall Risk Score</h3>
              <span className={`text-4xl font-bold
                ${riskScore >= 70 ? 'text-red-400' : riskScore >= 30 ? 'text-yellow-400' : 'text-green-400'}`}>
                {riskScore}/100
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
              <div
                className={`h-3 rounded-full transition-all duration-500
                  ${riskScore >= 70 ? 'bg-red-500' : riskScore >= 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${riskScore}%` }}
              ></div>
            </div>

            {/* Risk level badge */}
            <div className={`inline-block px-4 py-2 rounded font-bold
              ${riskLevel.color === 'red' ? 'bg-red-600' : riskLevel.color === 'yellow' ? 'bg-yellow-600' : 'bg-green-600'}`}>
              {riskLevel.label}
            </div>
          </div>

          {/* Risk Factors Breakdown */}
          {showBreakdown && (
            <div className="bg-slate-900 rounded-lg p-6 mb-6 animate-fadeIn">
              <h3 className="text-lg font-semibold mb-4 text-white">Risk Factor Breakdown</h3>
              <div className="space-y-4">
                {riskFactors.map((factor, index) => {
                  const Icon = factor.icon
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-300">{factor.name}</span>
                          <span className="text-xs text-gray-500">({factor.weight}% weight)</span>
                        </div>
                        <span className="text-sm font-semibold">{factor.score}/100</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full
                            ${factor.score >= 70 ? 'bg-red-500' : factor.score >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${factor.score}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Decision Display */}
          {showBreakdown && (
            <div className="bg-red-900/30 border-2 border-red-600 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-red-300 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                ADAPTIVE POLICY: {riskLevel.action}
              </h3>
              <p className="text-gray-300 mb-4">
                This prompt contains <strong>customer PII + financial data + account numbers</strong>.
                <br />
                <span className="text-red-300">Action: BLOCKED - Human review required before sending to ChatGPT</span>
              </p>
              <div className="bg-slate-900 rounded p-3 text-sm text-gray-400">
                <strong>What happens next:</strong> Case automatically created for Security Officer review.
                Expected review time: &lt;2 minutes. Employee will be notified via email.
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {showBreakdown && (
            <div className="flex gap-4">
              <Button variant="secondary" onClick={onBack}>
                ← Back to Input
              </Button>
              <Button variant="danger" onClick={onNext} fullWidth>
                Proceed to Human Review Console →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default RiskAnalysis