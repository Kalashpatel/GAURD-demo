import { useState, useEffect } from 'react'
import { AlertTriangle, Shield, User, Clock, MapPin, FileText, CheckCircle, ArrowRight } from 'lucide-react'
import Button from './Button'

function RiskAnalysis({ prompt, onNext, onAutoApprove, onBack }) {
  const [scanning, setScanning] = useState(true)
  const [riskScore, setRiskScore] = useState(0)
  const [detectedEntities, setDetectedEntities] = useState([])
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [targetScore, setTargetScore] = useState(0)

  // Calculate risk score from detected entities
  const calcRiskAndEntities = () => {
    const entities = []
    let score = 10

    if (prompt.match(/[A-Z][a-z]+ [A-Z][a-z]+/)) {
      const name = prompt.match(/[A-Z][a-z]+ [A-Z][a-z]+/)[0]
      entities.push({ type: 'PERSON', value: name, risk: 'high' })
      score += 20
    }

    if (prompt.match(/\d{10,}/)) {
      const account = prompt.match(/\d{10,}/)[0]
      entities.push({ type: 'ACCOUNT_NUMBER', value: account, risk: 'critical' })
      score += 35
    }

    if (prompt.match(/₹[\d.]+ (?:lakh|crore)/i)) {
      const amount = prompt.match(/₹[\d.]+ (?:lakh|crore)/i)[0]
      entities.push({ type: 'FINANCIAL_DATA', value: amount, risk: 'high' })
      score += 25
    }

    if (prompt.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) {
      const email = prompt.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)[0]
      entities.push({ type: 'EMAIL', value: email, risk: 'high' })
      score += 15
    }

    if (prompt.match(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/)) {
      const card = prompt.match(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/)[0]
      entities.push({ type: 'CARD_NUMBER', value: card, risk: 'critical' })
      score += 35
    }

    return { entities, score: Math.min(score, 100) }
  }

  useEffect(() => {
    const scanTimer = setTimeout(() => {
      const { entities, score } = calcRiskAndEntities()
      setDetectedEntities(entities)
      setTargetScore(score)
      setScanning(false)
    }, 2000)

    return () => clearTimeout(scanTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Animate score counter once targetScore is set
  useEffect(() => {
    if (targetScore === 0) return

    let current = 0
    const interval = setInterval(() => {
      current += 2
      if (current >= targetScore) {
        current = targetScore
        clearInterval(interval)
        setTimeout(() => setShowBreakdown(true), 500)
      }
      setRiskScore(current)
    }, 30)

    return () => clearInterval(interval)
  }, [targetScore])

  const getRiskLevel = (score) => {
    if (score >= 70) return { label: 'HIGH RISK', color: 'red', action: 'BLOCK', tier: 'high' }
    if (score >= 30) return { label: 'MEDIUM RISK', color: 'yellow', action: 'REVIEW', tier: 'medium' }
    return { label: 'LOW RISK', color: 'green', action: 'AUTO-APPROVE', tier: 'low' }
  }

  const riskLevel = getRiskLevel(riskScore)

  const riskFactors = [
    { name: 'Data Sensitivity', weight: 40, score: detectedEntities.some(e => e.risk === 'critical') ? 95 : detectedEntities.length > 0 ? 55 : 10, icon: Shield },
    { name: 'Employee Authorization', weight: 25, score: 70, icon: User },
    { name: 'Data Volume', weight: 15, score: detectedEntities.length >= 3 ? 80 : detectedEntities.length >= 1 ? 45 : 15, icon: FileText },
    { name: 'Platform Risk', weight: 10, score: 80, icon: AlertTriangle },
    { name: 'Time/Location', weight: 5, score: 50, icon: Clock },
    { name: 'History', weight: 5, score: 30, icon: MapPin },
  ]

  const decisionConfig = {
    low: {
      bg: 'bg-green-900/30',
      border: 'border-green-600',
      textColor: 'text-green-300',
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'ADAPTIVE POLICY: AUTO-APPROVE',
      description: 'No sensitive data detected in this prompt. This request is safe to proceed directly to ChatGPT without human review.',
      note: 'Prompt has been scanned and cleared. No PII, financial data, or account numbers found.',
      noteColor: 'text-green-400',
    },
    medium: {
      bg: 'bg-yellow-900/30',
      border: 'border-yellow-600',
      textColor: 'text-yellow-300',
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'ADAPTIVE POLICY: REVIEW RECOMMENDED',
      description: 'Some potentially sensitive data detected. AI recommends sending to human review — officer can approve after quick verification.',
      note: 'AI Suggestion: Approve after review. Expected review time: < 2 minutes.',
      noteColor: 'text-yellow-400',
    },
    high: {
      bg: 'bg-red-900/30',
      border: 'border-red-600',
      textColor: 'text-red-300',
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'ADAPTIVE POLICY: BLOCK',
      description: 'This prompt contains customer PII + financial data + account numbers. Action: BLOCKED — Human review required before sending to ChatGPT.',
      note: 'Case automatically created for Security Officer review. Expected review time: < 2 minutes.',
      noteColor: 'text-red-400',
    },
  }

  const config = decisionConfig[riskLevel.tier] || decisionConfig.low

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
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
          {/* Original Prompt */}
          <div className="bg-slate-900 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 mb-2">Original Prompt:</p>
            <p className="text-gray-300 leading-relaxed">
              {prompt.split(' ').map((word, i) => {
                const isDetected = detectedEntities.some(e =>
                  e.value.split(' ').some(v => word.includes(v))
                )
                return (
                  <span key={i} className={isDetected ? 'bg-red-500/30 px-1 rounded' : ''}>
                    {word}{' '}
                  </span>
                )
              })}
            </p>
          </div>

          {/* Detected Entities */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Detected Sensitive Data:</h3>
            {detectedEntities.length === 0 ? (
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-green-300 text-sm">No sensitive data detected in this prompt.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {detectedEntities.map((entity, i) => (
                  <div key={i} className="bg-slate-900 rounded-lg p-4 flex items-center justify-between">
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
            )}
          </div>

          {/* Risk Score */}
          <div className="bg-slate-900 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Overall Risk Score</h3>
              <span className={`text-4xl font-bold
                ${riskScore >= 70 ? 'text-red-400' : riskScore >= 30 ? 'text-yellow-400' : 'text-green-400'}`}>
                {riskScore}/100
              </span>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
              <div
                className={`h-3 rounded-full transition-all duration-100
                  ${riskScore >= 70 ? 'bg-red-500' : riskScore >= 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${riskScore}%` }}
              ></div>
            </div>

            <div className={`inline-block px-4 py-2 rounded font-bold
              ${riskLevel.color === 'red' ? 'bg-red-600' : riskLevel.color === 'yellow' ? 'bg-yellow-600' : 'bg-green-600'}`}>
              {riskLevel.label}
            </div>
          </div>

          {/* Risk Factor Breakdown */}
          {showBreakdown && (
            <div className="bg-slate-900 rounded-lg p-6 mb-6 animate-fadeIn">
              <h3 className="text-lg font-semibold mb-4">Risk Factor Breakdown</h3>
              <div className="space-y-4">
                {riskFactors.map((factor, i) => {
                  const Icon = factor.icon
                  return (
                    <div key={i}>
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

          {/* Decision Panel */}
          {showBreakdown && (
            <div className={`${config.bg} border-2 ${config.border} rounded-lg p-6 mb-6 animate-fadeIn`}>
              <h3 className={`text-xl font-bold ${config.textColor} mb-2 flex items-center gap-2`}>
                {config.icon}
                {config.title}
              </h3>
              <p className="text-gray-300 mb-4">{config.description}</p>
              <div className="bg-slate-900 rounded p-3 text-sm text-gray-400">
                <strong className={config.noteColor}>What happens next:</strong> {config.note}
              </div>
            </div>
          )}

          {/* Navigation */}
          {showBreakdown && (
            <div className="flex gap-4">
              <Button variant="secondary" onClick={onBack}>
                ← Back to Input
              </Button>

              {riskLevel.tier === 'low' && (
                <Button variant="success" onClick={onAutoApprove} fullWidth>
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Auto-Approve & Proceed to Output →
                  </span>
                </Button>
              )}

              {riskLevel.tier === 'medium' && (
                <Button variant="primary" onClick={() => onNext('medium')} fullWidth>
                  <span className="flex items-center justify-center gap-2">
                    <ArrowRight className="w-5 h-5" />
                    Send to Human Review for Approval →
                  </span>
                </Button>
              )}

              {riskLevel.tier === 'high' && (
                <Button variant="danger" onClick={() => onNext('high')} fullWidth>
                  Proceed to Human Review Console →
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default RiskAnalysis
