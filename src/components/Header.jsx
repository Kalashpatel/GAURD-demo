import { Shield } from 'lucide-react'

function Header() {
  return (
    <div className="max-w-6xl mx-auto mb-8">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-7 h-7 md:w-10 md:h-10 text-blue-400" />
        <h1 className="text-2xl md:text-4xl font-bold text-white">G.U.A.R.D.</h1>
      </div>
      <p className="text-blue-200 text-sm">
        Global Universal Authentication & Risk Defense - Live Demo
      </p>
    </div>
  )
}

export default Header