import { useState, useEffect } from 'react'
import { Shield, CheckCircle, ArrowRight, Eye, FileCheck, Ban, AlertTriangle, XCircle } from 'lucide-react'
import Button from './Button'

function OutputVerification({ prompt, decision, onBack, onRestart }) {
  // Animation states
  const [currentPhase, setCurrentPhase] = useState(1)
  const [processing, setProcessing] = useState(true)

  // Tokenization mapping
  const tokenMapping = {
    original: {
      customerName: 'Rajesh Kumar',
      accountNumber: '9876543210',
      amount: '₹45 lakh',
    },
    tokenized: {
      customerName: 'USER_S7K2M',
      accountNumber: 'XXXX3210',
      amount: '[HIGH_VALUE]',
    },
  }

  // Different timelines for different decisions
  useEffect(() => {
    if (decision === 'decline') {
      // Fast path - just show blocked message
      setTimeout(() => {
        setProcessing(false)
      }, 1500)
    } else if (decision === 'approve') {
      // Approve path - no tokenization
      const timers = [
        setTimeout(() => setCurrentPhase(2), 1500),  // ChatGPT processing
        setTimeout(() => setCurrentPhase(3), 3000),  // Verify output
        setTimeout(() => {
          setCurrentPhase(4)
          setProcessing(false)
        }, 5000),
      ]
      return () => timers.forEach(timer => clearTimeout(timer))
    } else {
      // Tokenize path (default) - full flow
      const timers = [
        setTimeout(() => setCurrentPhase(2), 2000),
        setTimeout(() => setCurrentPhase(3), 4000),
        setTimeout(() => {
          setCurrentPhase(4)
          setProcessing(false)
        }, 6500),
      ]
      return () => timers.forEach(timer => clearTimeout(timer))
    }
  }, [decision])

  // Mock ChatGPT responses based on decision
  const getChatGPTResponse = () => {
    if (decision === 'approve') {
      // Original prompt sent directly
      return `Portfolio Analysis for ${tokenMapping.original.customerName}:

Account ${tokenMapping.original.accountNumber} shows a ${tokenMapping.original.amount} investment portfolio focused on equity funds. 

Key Observations:
1. Diversification: Well-balanced across large-cap (60%) and mid-cap (40%) equity funds
2. Risk Profile: Moderate-aggressive with 5-year horizon
3. Performance: 12.3% CAGR over past 3 years
4. Recommendation: Consider adding 10-15% debt allocation for stability

Tax Optimization: Current holdings eligible for LTCG benefits after 1 year.`
    } else {
      // Tokenized version
      return `Portfolio Analysis for ${tokenMapping.tokenized.customerName}:

Account ${tokenMapping.tokenized.accountNumber} shows a ${tokenMapping.tokenized.amount} investment portfolio focused on equity funds. 

Key Observations:
1. Diversification: Well-balanced across large-cap (60%) and mid-cap (40%) equity funds
2. Risk Profile: Moderate-aggressive with 5-year horizon
3. Performance: 12.3% CAGR over past 3 years
4. Recommendation: Consider adding 10-15% debt allocation for stability

Tax Optimization: Current holdings eligible for LTCG benefits after 1 year.`
    }
  }

  const chatGPTResponse = getChatGPTResponse()

  const finalResponse = decision === 'tokenize' 
    ? chatGPTResponse
        .replace(tokenMapping.tokenized.customerName, tokenMapping.original.customerName)
        .replace(tokenMapping.tokenized.accountNumber, tokenMapping.original.accountNumber)
        .replace(tokenMapping.tokenized.amount, tokenMapping.original.amount)
    : chatGPTResponse

  // Safety checks
  const safetyChecks = [
    { name: 'Hallucination Detection', status: 'pass', detail: 'No invented customer names found' },
    { name: 'Harmful Content Scan', status: 'pass', detail: 'No illegal advice detected' },
    { name: 'Data Leak Check', status: decision === 'approve' ? 'warning' : 'pass', 
      detail: decision === 'approve' ? 'Real customer data sent to OpenAI' : 'No real SSNs or cards in response' },
    { name: 'Policy Compliance', status: 'pass', detail: 'Meets banking regulations' },
  ]

  // ========== DECLINE PATH ==========
  if (decision === 'decline') {
    return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Ban className="w-6 h-6 text-red-400" />
          Request Declined by Security Officer
        </h2>

        <div className="bg-red-900/30 border-2 border-red-600 rounded-lg p-8 mb-6">
          <div className="text-center mb-6">
            <XCircle className="w-24 h-24 mx-auto text-red-400 mb-4" />
            <h3 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h3>
            <p className="text-gray-300">
              This prompt has been blocked due to policy violation.
            </p>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 mb-4">
            <p className="text-sm text-gray-400 mb-2">Blocked Prompt:</p>
            <p className="text-gray-300 italic">{prompt}</p>
          </div>

          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-3">📧 <strong>Employee Notification:</strong></p>
            <div className="text-sm text-gray-300 space-y-2">
              <p>Dear Priya Sharma,</p>
              <p>Your ChatGPT request (Case #12789) has been reviewed and declined for the following reason:</p>
              <p className="bg-red-900/30 p-3 rounded border-l-4 border-red-500">
                <strong>Reason:</strong> Prompt contains sensitive customer PII and financial data that cannot be 
                shared with external AI services, even for legitimate business purposes.
              </p>
              <p><strong>Alternative:</strong> Please rephrase your request without including specific customer names, 
              account numbers, or financial amounts. Use general terms like "high-value client portfolio analysis."</p>
              <p className="text-gray-500">- Security Team</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-white"> Audit Trail</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Case ID:</span>
              <span className="font-mono text-white">CASE-12789</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Decision:</span>
              <span className="text-red-400 font-semibold">DECLINED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Reviewed By:</span>
              <span className='text-white'>Officer Amit Mehta</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Biometric Proof:</span>
              <span className="text-green-400">✓ Verified (Fingerprint)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Timestamp:</span>
              <span className="font-mono text-white">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="secondary" onClick={onBack}>
            ← Back to Review
          </Button>
          <Button variant="primary" onClick={onRestart} fullWidth>
            Start New Demo
          </Button>
        </div>
      </div>
    )
  }

  // ========== APPROVE & TOKENIZE PATHS ==========
  return (
    <div>
      <h2 className="text-2xl text-white font-bold mb-6 flex items-center gap-2">
        {decision === 'approve' ? (
          <>
            <CheckCircle className="w-6 h-6 text-yellow-400" />
            Approved As-Is (Original Prompt Sent)
          </>
        ) : (
          <>
            <Shield className="w-6 h-6 text-green-400" />
            Layer 6: Bidirectional Protection (Tokenized)
          </>
        )}
      </h2>

      {decision === 'approve' && (
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-6">
          <p className="text-yellow-200 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <strong>Warning:</strong> Real customer data is being sent to ChatGPT. Only use this for public information or false positives.
          </p>
        </div>
      )}

      {decision === 'tokenize' && (
        <p className="text-gray-300 mb-6">
          Your unique innovation: <strong className="text-green-400">Tokenize input + Verify output</strong> - 
          ChatGPT never sees real customer data, employee gets complete answer.
        </p>
      )}

      {/* Progress Timeline */}
      <div className="bg-slate-900 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          {decision === 'tokenize' ? (
            // Full 4-step process for tokenization
            [
              { num: 1, label: 'Tokenize Input', icon: Shield },
              { num: 2, label: 'Send to ChatGPT', icon: ArrowRight },
              { num: 3, label: 'Verify Output', icon: FileCheck },
              { num: 4, label: 'De-tokenize', icon: CheckCircle },
            ].map((step) => {
              const Icon = step.icon
              const isActive = currentPhase >= step.num
              const isCurrent = currentPhase === step.num

              return (
                <div key={step.num} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all
                      ${isActive ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'}
                      ${isCurrent ? 'ring-4 ring-green-400 animate-pulse' : ''}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className={`text-xs text-center ${isActive ? 'text-white' : 'text-gray-500'}`}>
                    {step.label}
                  </p>
                </div>
              )
            })
          ) : (
            // Simpler 3-step for approve
            [
              { num: 1, label: 'Send Original', icon: ArrowRight },
              { num: 2, label: 'ChatGPT Process', icon: Eye },
              { num: 3, label: 'Verify Output', icon: FileCheck },
            ].map((step, index) => {
              const Icon = step.icon
              const isActive = currentPhase >= index + 1
              const isCurrent = currentPhase === index + 1

              return (
                <div key={step.num} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all
                      ${isActive ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-gray-400'}
                      ${isCurrent ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className={`text-xs text-center ${isActive ? 'text-white' : 'text-gray-500'}`}>
                    {step.label}
                  </p>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Phase 1: Tokenization (only for tokenize decision) */}
      {decision === 'tokenize' && (
        <div className="bg-slate-900 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Phase 1: Input Tokenization
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-2">❌ Original (Sensitive):</p>
              <div className="bg-red-900/30 border border-red-600 rounded p-3 space-y-2">
                <div>
                  <span className="text-xs text-gray-400">Customer:</span>
                  <p className="text-red-300 font-semibold">{tokenMapping.original.customerName}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Account:</span>
                  <p className="text-red-300 font-semibold">{tokenMapping.original.accountNumber}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Amount:</span>
                  <p className="text-red-300 font-semibold">{tokenMapping.original.amount}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">✅ Tokenized (Safe):</p>
              <div className="bg-green-900/30 border border-green-600 rounded p-3 space-y-2">
                <div>
                  <span className="text-xs text-gray-400">Token:</span>
                  <p className="text-green-300 font-semibold font-mono">{tokenMapping.tokenized.customerName}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Token:</span>
                  <p className="text-green-300 font-semibold font-mono">{tokenMapping.tokenized.accountNumber}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Token:</span>
                  <p className="text-green-300 font-semibold font-mono">{tokenMapping.tokenized.amount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ChatGPT Response */}
      {currentPhase >= 2 && (
        <div className="bg-slate-900 rounded-lg p-6 mb-6 animate-fadeIn">
          <h3 className="text-lg text-white font-semibold mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-purple-400" />
            ChatGPT Response
          </h3>

          <div className="bg-slate-800 rounded p-4 border-l-4 border-purple-500">
            <p className="text-xs text-gray-500 mb-2">Response from OpenAI:</p>
            <p className="text-gray-300 font-mono text-sm whitespace-pre-line">
              {chatGPTResponse}
            </p>
          </div>

          {decision === 'tokenize' && (
            <div className="mt-4 flex items-start gap-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
              <p>ChatGPT used tokens only - never saw "Rajesh Kumar" or "9876543210"</p>
            </div>
          )}

          {decision === 'approve' && (
            <div className="mt-4 flex items-start gap-2 text-sm text-yellow-300">
              <AlertTriangle className="w-4 h-4 mt-0.5" />
              <p>Real customer data was sent to OpenAI servers</p>
            </div>
          )}
        </div>
      )}

      {/* Output Verification */}
      {currentPhase >= 3 && (
        <div className="bg-slate-900 rounded-lg p-6 mb-6 animate-fadeIn">
          <h3 className="text-lg text-white font-semibold mb-4 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-yellow-400" />
            Output Safety Verification
          </h3>

          <div className="space-y-3">
            {safetyChecks.map((check, index) => (
              <div
                key={index}
                className="bg-slate-800 rounded p-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-white">{check.name}</p>
                  <p className="text-xs text-gray-400">{check.detail}</p>
                </div>
                <div className={`flex items-center gap-2 ${check.status === 'warning' ? 'text-yellow-400' : 'text-green-400'}`}>
                  {check.status === 'warning' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  <span className="font-semibold">{check.status.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final Result */}
      {currentPhase >= 4 && !processing && (
        <div className={`border-2 rounded-lg p-6 mb-6 animate-fadeIn ${
          decision === 'tokenize' 
            ? 'bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-600' 
            : 'bg-yellow-900/30 border-yellow-600'
        }`}>
          <h3 className="text-xl text-white font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-6 h-6" />
            Final Result for Employee
          </h3>

          <div className="bg-slate-900 rounded p-4 mb-4">
            <div className="text-gray-300 whitespace-pre-line leading-relaxed">
              {finalResponse}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-800 rounded p-3">
              <p className={`text-2xl font-bold ${decision === 'tokenize' ? 'text-green-400' : 'text-yellow-400'}`}>
                {decision === 'tokenize' ? '100%' : '0%'}
              </p>
              <p className="text-xs text-gray-400">Data Protected</p>
            </div>
            <div className="bg-slate-800 rounded p-3">
              <p className={`text-2xl font-bold ${decision === 'tokenize' ? 'text-blue-400' : 'text-red-400'}`}>
                {decision === 'tokenize' ? '0' : '3'}
              </p>
              <p className="text-xs text-gray-400">Leaks to OpenAI</p>
            </div>
            <div className="bg-slate-800 rounded p-3">
              <p className="text-2xl font-bold text-purple-400">100%</p>
              <p className="text-xs text-gray-400">Utility</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!processing && (
        <div className="flex gap-4">
          <Button variant="secondary" onClick={onBack}>
            ← Back
          </Button>
          <Button variant="success" onClick={onRestart} fullWidth>
            Start New Demo
          </Button>
        </div>
      )}
    </div>
  )
}

export default OutputVerification