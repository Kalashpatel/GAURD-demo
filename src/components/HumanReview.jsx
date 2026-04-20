import { useState, useEffect } from 'react'
import { User, Clock, Shield, CheckCircle, Ban, Fingerprint } from 'lucide-react'
import Button from './Button'

function HumanReview({ prompt, onNext, onBack }) {
    // State management
    const [timeRemaining, setTimeRemaining] = useState(60 * 60) // 60 minutes in seconds
    const [showBiometric, setShowBiometric] = useState(false)
    const [selectedAction, setSelectedAction] = useState(null)
    const [verifying, setVerifying] = useState(false)
    const [verified, setVerified] = useState(false)

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prev => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Highlight sensitive data in the prompt
    const highlightSensitiveData = (text) => {
        // Define patterns to detect sensitive data
        const patterns = [
            { regex: /([A-Z][a-z]+ [A-Z][a-z]+)/g, type: 'PERSON', color: 'bg-red-500' },           // Names
            { regex: /(\d{10,})/g, type: 'ACCOUNT', color: 'bg-red-600' },                          // Account numbers
            { regex: /(₹[\d.]+ (?:lakh|crore|thousand))/gi, type: 'FINANCIAL', color: 'bg-orange-600' }, // Financial amounts
            { regex: /\b(\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4})\b/g, type: 'CARD', color: 'bg-red-700' }, // Card numbers
            { regex: /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, type: 'EMAIL', color: 'bg-orange-500' }, // Emails
        ]

        let parts = [{ text, highlighted: false }]

        // Apply each pattern
        patterns.forEach(({ regex, color }) => {
            const newParts = []
            parts.forEach(part => {
                if (part.highlighted) {
                    newParts.push(part)
                } else {
                    const splits = part.text.split(regex)
                    splits.forEach((split) => {
                        if (split) {
                            // Check if this part matches the pattern
                            const isMatch = regex.test(split)
                            regex.lastIndex = 0 // Reset regex state
                            newParts.push({
                                text: split,
                                highlighted: isMatch,
                                color: isMatch ? color : part.color,
                            })
                        }
                    })
                }
            })
            parts = newParts
        })

        // Render parts with highlighting
        return parts.map((part, index) => {
            if (part.highlighted) {
                return (
                    <span
                        key={index}
                        className={`${part.color} px-2 py-1 rounded font-semibold text-white`}
                    >
                        {part.text}
                    </span>
                )
            }
            return <span key={index}>{part.text}</span>
        })
    }

    // Handle action button clicks
    const handleAction = (action) => {
        setSelectedAction(action)
        setShowBiometric(true)
    }

    // Simulate biometric verification
    const handleBiometricVerify = () => {
        setVerifying(true)
        setTimeout(() => {
            setVerifying(false)
            setVerified(true)
            setTimeout(() => onNext(selectedAction), 1500) // ← PASS selectedAction to parent
        }, 2000)
    }

    // Mock data
    const caseData = {
        id: 'CASE-12789',
        timestamp: new Date().toLocaleString(),
        employee: {
            name: 'Priya Sharma',
            role: 'Relationship Manager',
            department: 'Retail Banking',
            authorized: true,
        },
        aiRecommendation: {
            action: 'Tokenize & Approve',
            confidence: 87,
            reasoning: 'Employee is authorized to access this customer. Recommend sanitizing data before sending to ChatGPT.',
        },
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 flex text-white items-center gap-2">
                <User className="w-6 h-6 text-purple-400" />
                Human Review Console - Security Officer
            </h2>

            {/* Officer Info Panel */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4 mb-6 flex items-center justify-between border border-purple-600/30">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Reviewing Officer</p>
                        <p className="font-semibold text-white">Officer Amit Mehta</p>
                        <p className="text-xs text-gray-500">Security Team Lead</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-400">Device Status</p>
                    <p className="text-green-400 font-semibold flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        Verified & Active
                    </p>
                </div>
            </div>

            {/* Case Information */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-900 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Case ID</p>
                    <p className="font-mono text-lg font-semibold text-white">{caseData.id}</p>
                </div>
                <div className="bg-slate-900 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Created At</p>
                    <p className="text-sm text-white">{caseData.timestamp}</p>
                </div>
                <div className="bg-slate-900 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Time Remaining
                    </p>
                    <p className={`text-lg font-semibold ${timeRemaining < 900 ? 'text-red-400' : 'text-green-400'}`}>
                        {formatTime(timeRemaining)}
                    </p>
                </div>
            </div>

            {/* Employee Context */}
            <div className="bg-slate-900 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    Employee Context
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="font-semibold text-white">{caseData.employee.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Role</p>
                        <p className="font-semibold text-white">{caseData.employee.role}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Department</p>
                        <p className="font-semibold text-white">{caseData.employee.department}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Authorization Status</p>
                        <p className={`font-semibold flex items-center gap-2 ${caseData.employee.authorized ? 'text-green-400' : 'text-red-400'}`}>
                            {caseData.employee.authorized ? (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Authorized
                                </>
                            ) : (
                                <>
                                    <Ban className="w-4 h-4" />
                                    Unauthorized
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Flagged Prompt */}
            <div className="bg-slate-900 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-3 text-white">Flagged Prompt</h3>
                <div className="bg-slate-800 rounded mb-2 p-4 border border-red-500/30">
                    <p className="text-gray-300 leading-relaxed">
                        {highlightSensitiveData(prompt)}
                    </p>
                </div>

                {/* AI Recommendation */}
                <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-400" />
                        AI Recommendation
                    </h3>
                    <div className="mb-3">
                        <p className="text-blue-200 font-semibold text-lg">{caseData.aiRecommendation.action}</p>
                        <p className="text-sm text-gray-400">Confidence: {caseData.aiRecommendation.confidence}%</p>
                    </div>
                    <p className="text-gray-300 text-sm">{caseData.aiRecommendation.reasoning}</p>
                </div>

                {/* Decision Buttons */}
                {!showBiometric ? (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <button
                            onClick={() => handleAction('approve')}
                            className="bg-green-600 hover:bg-green-700 p-6 rounded-lg transition flex flex-col items-center gap-2"
                        >
                            <CheckCircle className="w-8 h-8" />
                            <span className="font-semibold">Approve As-Is</span>
                            <span className="text-xs text-green-200">Send original prompt</span>
                        </button>

                        <button
                            onClick={() => handleAction('tokenize')}
                            className="bg-blue-600 hover:bg-blue-700 p-6 rounded-lg transition flex flex-col items-center gap-2 border-2 border-blue-400"
                        >
                            <Shield className="w-8 h-8" />
                            <span className="font-semibold">Tokenize & Approve</span>
                            <span className="text-xs text-blue-200">Recommended by AI</span>
                        </button>

                        <button
                            onClick={() => handleAction('decline')}
                            className="bg-red-600 hover:bg-red-700 p-6 rounded-lg transition flex flex-col items-center gap-2"
                        >
                            <Ban className="w-8 h-8" />
                            <span className="font-semibold">Decline</span>
                            <span className="text-xs text-red-200">Block & notify employee</span>
                        </button>
                    </div>
                ) : (
                    /* Biometric Verification Panel */
                    <div className="bg-slate-900 rounded-lg p-8 mb-6">
                        <h3 className="text-xl font-semibold mb-6 text-center text-white">
                            Biometric Verification Required
                        </h3>

                        {!verified ? (
                            <div className="text-center">
                                <div className={`inline-block mb-6 ${verifying ? 'animate-pulse' : ''}`}>
                                    <Fingerprint className={`w-24 h-24 mx-auto ${verifying ? 'text-blue-400' : 'text-gray-400'}`} />
                                </div>

                                <p className="text-gray-300 mb-2">
                                    {verifying ? 'Verifying fingerprint...' : 'Place your finger on the sensor'}
                                </p>
                                <p className="text-sm text-gray-500 mb-6">
                                    Action: <strong className="text-blue-400">{selectedAction?.toUpperCase()}</strong>
                                </p>

                                {!verifying ? (
                                    <div className="flex gap-4 justify-center">
                                        <Button variant="secondary" onClick={() => setShowBiometric(false)}>
                                            Cancel
                                        </Button>
                                        <Button variant="primary" onClick={handleBiometricVerify}>
                                            <Fingerprint className="w-5 h-5 inline mr-2" />
                                            Verify Fingerprint
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 text-blue-400">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent"></div>
                                        <span>Verifying with FIDO2 protocol...</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center animate-fadeIn">
                                <CheckCircle className="w-24 h-24 mx-auto text-green-400 mb-4" />
                                <p className="text-2xl font-bold text-green-400 mb-2">Verified Successfully!</p>
                                <p className="text-gray-400">
                                    Decision recorded with cryptographic proof. Proceeding to tokenization...
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Info Box */}
                <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
                    <p className="text-sm text-gray-300">
                        <strong>Human × Agent Pattern:</strong> AI provided context (87% confidence recommendation),
                        but YOU make the final business judgment. Your decision will be logged with biometric proof
                        for audit trail compliance.
                    </p>
                </div>

                {/* Back Button */}
                {!showBiometric && (
                    <div className="mt-6">
                        <Button variant="secondary" onClick={onBack}>
                            ← Back to Risk Analysis
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default HumanReview