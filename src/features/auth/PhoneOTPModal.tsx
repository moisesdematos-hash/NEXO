import React, { useState } from 'react';
import { Phone, X, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PhoneOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PhoneOTPModal: React.FC<PhoneOTPModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { signInWithPhoneOTP, verifyPhoneOTP } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMsg('Por favor insira um número de telefone válido.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    const { error } = await signInWithPhoneOTP(phone);
    setLoading(false);

    if (error) {
      setErrorMsg(`Erro ao enviar código SMS: ${error.message}`);
    } else {
      setSuccessMsg('Código de verificação enviado por SMS!');
      setStep('otp');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpToken.trim() || otpToken.length < 6) {
      setErrorMsg('Por favor introduza o código de 6 dígitos enviado por SMS.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    const { error } = await verifyPhoneOTP(phone, otpToken);
    setLoading(false);

    if (error) {
      setErrorMsg(`Código inválido ou expirado: ${error.message}`);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative animate-scale-in">
        
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Phone size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Entrar com Telefone + OTP
              </h3>
              <p className="text-xs text-slate-500">Autenticação rápida por SMS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label="Fechar Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Banner de Brevemente */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
          <span className="leading-relaxed">
            🚀 A integração de envio de SMS global está em fase final de testes e ficará 100% ativa <strong>brevemente</strong>.
          </span>
          <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 shrink-0">
            Brevemente
          </span>
        </div>

        {/* Notificações de Erro / Sucesso */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Formulário Passo 1: Inserir Número de Telefone */}
        {step === 'phone' ? (
          <form onSubmit={handleSendPhone} className="space-y-4">
            <div>
              <label htmlFor="phone-input" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Número de Telemóvel (com indicativo)
              </label>
              <input
                id="phone-input"
                type="tel"
                placeholder="+351 912 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'A enviar SMS...' : 'Enviar Código SMS'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          /* Formulário Passo 2: Inserir OTP */
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label htmlFor="otp-input" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Código SMS de 6 dígitos enviado para {phone}
              </label>
              <input
                id="otp-input"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value)}
                className="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-1/3 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md transition-all"
              >
                {loading ? 'A verificar...' : 'Confirmar & Entrar'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
