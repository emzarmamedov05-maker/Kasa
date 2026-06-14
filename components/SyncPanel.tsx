
import React, { useState, useEffect } from 'react';

interface Props {
  syncCode: string;
  syncStatus: 'online' | 'syncing' | 'reconnecting' | 'offline';
  lastSync: Date | null;
  onSetSyncCode: (code: string) => void;
  onManualSync: () => void;
}

const SyncPanel: React.FC<Props> = ({ syncCode, syncStatus, lastSync, onSetSyncCode, onManualSync }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempCode, setTempCode] = useState(syncCode);

  useEffect(() => {
    setTempCode(syncCode);
  }, [syncCode]);

  const handleSave = () => {
    const finalCode = tempCode.toUpperCase().trim();
    if (finalCode.length < 3) return;
    onSetSyncCode(finalCode);
    setIsOpen(false);
  };

  const statusColors = {
    online: 'bg-emerald-500 border-emerald-500/40 text-emerald-400',
    syncing: 'bg-amber-500 border-amber-500/40 text-amber-400',
    reconnecting: 'bg-amber-500 border-amber-500/40 text-amber-400',
    offline: 'bg-red-500 border-red-500/40 text-red-400'
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all shadow-lg active:scale-95 ${
          syncCode ? statusColors[syncStatus].replace('bg-', 'bg-opacity-10 bg-') : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-amber-500/40'
        }`}
      >
        <div className={`w-3 h-3 rounded-full ${syncCode ? statusColors[syncStatus].split(' ')[0] : 'bg-slate-700'} ${syncStatus === 'syncing' || syncStatus === 'reconnecting' ? 'animate-pulse' : ''}`}></div>
        <span className="text-[11px] font-black uppercase tracking-widest">
          {syncCode ? (
            syncStatus === 'offline' ? 'BAĞLANTI HATASI' : 
            syncStatus === 'reconnecting' ? 'BAĞLANILIYOR...' : 
            `KOD: ${syncCode}`
          ) : 'CİHAZLA EŞLEŞTİR'}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 bg-slate-900 border-2 border-slate-800 p-7 rounded-3xl shadow-2xl z-50 animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-8">
             <div className="flex flex-col">
               <h4 className="text-white font-black text-sm uppercase tracking-tighter">Bulut Kontrol</h4>
               <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Eşleme Ayarları</p>
             </div>
             <button 
              onClick={() => { onManualSync(); }} 
              disabled={syncStatus === 'syncing'} 
              className="bg-slate-800 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all active:scale-90"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${syncStatus === 'syncing' ? 'animate-spin text-amber-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
             </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] text-slate-500 block mb-3 uppercase font-black tracking-[0.2em]">Salon Eşleme Kodu</label>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="ÖRN: SALON01"
                  className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl py-4 px-5 text-white text-base font-mono focus:border-amber-500 outline-none uppercase transition-all shadow-inner"
                  value={tempCode}
                  onChange={(e) => setTempCode(e.target.value)}
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 py-4 rounded-xl font-black text-xs tracking-[0.2em] transition-all shadow-xl shadow-amber-900/10 active:scale-[0.98]"
            >
              KAYDET VE BAĞLAN
            </button>
            
            <div className="pt-6 border-t border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Durum:</span>
                <span className={`text-[9px] font-black uppercase tracking-widest ${syncStatus === 'online' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {syncStatus === 'online' ? 'Senkronize' : 'Bağlanıyor'}
                </span>
              </div>
              {lastSync && (
                <p className="text-[10px] text-slate-500 font-mono text-right">
                  Son: {lastSync.toLocaleTimeString()}
                </p>
              )}
            </div>

            {syncStatus === 'offline' && (
              <div className="bg-red-500/10 border-2 border-red-500/20 p-4 rounded-2xl animate-pulse">
                 <p className="text-[10px] text-red-400 font-black tracking-tight leading-relaxed">
                   SUNUCU İLE BAĞLANTI KURULAMIYOR. İNTERNETİNİZİ KONTROL EDİN VEYA SAYFAYI YENİLEYİN.
                 </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncPanel;
